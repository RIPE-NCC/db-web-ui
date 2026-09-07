package net.ripe.whois.config.hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.authentication.logout.OidcLogoutToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Needed for OIDC Back-Channel Logout. We use {@code @EnableHazelcastHttpSession} so any node can get the HTTPSession.
 * Back-channel logout needs its own correlation between the IdP session and the local client Session (HTTPSession).
 * This cache is required when the IdP sends the logout request which contains information that we need to match with
 * our HttpSession and remove it from the nodes in case it matches.
 */
public class HazelcastOidcSessionRegistry implements OidcSessionRegistry {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastOidcSessionRegistry.class);

    public static final String OIDC_SESSIONS_MAP = "oidc-session-registry";

    private final HazelcastInstance hazelcastInstance;

    public HazelcastOidcSessionRegistry(HazelcastInstance hazelcastInstance) {
        this.hazelcastInstance = hazelcastInstance;
    }

    private IMap<String, OidcSessionInformation> map() {
        return hazelcastInstance.getMap(OIDC_SESSIONS_MAP);
    }

    /**
     * Stores the correlation between this HttpSession's ID and the IdP's session claims
     * so a later back-channel logout request can find which HttpSession to invalidate.
     */
    @Override
    public void saveSessionInformation(final OidcSessionInformation info) {
        map().set(info.getSessionId(), info);
        LOGGER.debug("HZ OIDC session SAVE clientSessionId={}", info.getSessionId());
    }

    @Override
    public OidcSessionInformation removeSessionInformation(final String clientSessionId) {
        final OidcSessionInformation removed = map().remove(clientSessionId);
        LOGGER.debug("HZ OIDC session REMOVE clientSessionId={} found={}", clientSessionId, removed != null);
        return removed;
    }

    /**
     * Finds and removes matching correlation entries (by sid, or by sub+iss) from this registry;
     * the returned sessionIds are then used by OidcBackChannelLogoutHandler to invalidate the actual HttpSessions.
     **/
    @Override
    public Iterable<OidcSessionInformation> removeSessionInformation(final OidcLogoutToken token) {
        LOGGER.debug("HZ OIDC session REMOVE token={}", token);
        final List<OidcSessionInformation> matches = new ArrayList<>();
        for (Map.Entry<String, OidcSessionInformation> entry : map().entrySet()) {
            if (matches(entry.getValue(), token)) {
                matches.add(entry.getValue());
            }
        }
        matches.forEach(m -> map().remove(m.getSessionId()));
        return matches;
    }

    private boolean matches(OidcSessionInformation info, OidcLogoutToken token) {
        final OidcUser oidcUser = info.getPrincipal();

        final String sid = token.getSessionId();
        return sid != null && oidcUser.getClaimAsString("sid").equals(sid);
    }
}