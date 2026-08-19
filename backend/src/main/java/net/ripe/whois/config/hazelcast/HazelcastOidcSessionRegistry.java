package net.ripe.whois.config.hazelcast;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.authentication.logout.OidcLogoutToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;

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

    private final IMap<String, OidcSessionInformation> sessions;

    public static final String OIDC_SESSIONS_MAP = "oidc-sessions";

    public HazelcastOidcSessionRegistry(HazelcastInstance hazelcastInstance) {
        this.sessions = hazelcastInstance.getMap(OIDC_SESSIONS_MAP);
    }

    @Override
    public void saveSessionInformation(OidcSessionInformation information) {
        // no-op — HazelcastSecurityContextRepository.saveContext() already persisted this.
    }

    @Override
    public OidcSessionInformation removeSessionInformation(String clientSessionId) {
        final OidcSessionInformation removed = sessions.remove(clientSessionId);
        LOGGER.warn("HZ REMOVE clientSessionId={} removed={}", clientSessionId, removed != null);
        return removed;
    }
    @Override
    public List<OidcSessionInformation> removeSessionInformation(OidcLogoutToken token) {
        List<String> matchedKeys = sessions.entrySet().stream()
                .filter(entry -> matches(entry.getValue(), token))
                .map(Map.Entry::getKey)
                .toList();

        List<OidcSessionInformation> removed = new ArrayList<>();
        for (String key : matchedKeys) {
            OidcSessionInformation info = sessions.remove(key);
            if (info != null) {
                removed.add(info);
            }
        }
        LOGGER.warn("HZ REMOVE removed={}", removed.stream().map( OidcSessionInformation::getSessionId).toList());

        return removed;
    }

    private boolean matches(OidcSessionInformation info, OidcLogoutToken token) {
        boolean subMatches = info.getPrincipal().getSubject().equals(token.getSubject());
        Object infoSid = info.getPrincipal().getClaim("sid");
        Object tokenSid = token.getClaim("sid");
        boolean sidMatches = tokenSid == null || infoSid == null || infoSid.equals(tokenSid);
        return subMatches && sidMatches;
    }
}

