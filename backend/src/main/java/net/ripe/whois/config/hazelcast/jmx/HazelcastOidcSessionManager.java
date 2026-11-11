package net.ripe.whois.config.hazelcast.jmx;

import com.hazelcast.core.EntryView;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import jakarta.annotation.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

import static net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP;

@Component
public class HazelcastOidcSessionManager {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastOidcSessionManager.class);

    private final OidcSessionRegistry oidcSessionRegistry;

    private final IMap<String, OidcSessionInformation> oidcSessionMap;

    public HazelcastOidcSessionManager(final OidcSessionRegistry oidcSessionRegistry,
                                final HazelcastInstance hazelcastInstance) {
        this.oidcSessionMap = hazelcastInstance.getMap(OIDC_SESSIONS_MAP);
        this.oidcSessionRegistry = oidcSessionRegistry;
    }

    public List<String> getSessionDetailsByEmail(final String email) {
        return oidcSessionMap.values().stream()
                .filter(info -> email.equalsIgnoreCase(info.getPrincipal().getEmail()))
                .map(info -> prepareOidcSessionInformation(oidcSessionMap.getEntryView(info.getSessionId())))
                .toList();
    }

    @Nullable
    public String getSession(final String sessionId) {
        if (!isExistingSession(sessionId)) {
            return null;
        }
        return prepareOidcSessionInformation(oidcSessionMap.getEntryView(sessionId));
    }

    public void removeSession(final String sessionId) {
        if (!isExistingSession(sessionId)) {
            return;
        }
        oidcSessionRegistry.removeSessionInformation(sessionId);
    }

    private boolean isExistingSession(String sessionId) {
        if (oidcSessionMap.containsKey(sessionId)) {
            return true;
        }
        LOGGER.error("Session with ID {} not found", sessionId);
        return false;
    }

    private String prepareOidcSessionInformation(final EntryView<String, OidcSessionInformation> view) {
        final OidcSessionInformation oidcSessionInformation = view.getValue();
        final OidcUser oidcUser = oidcSessionInformation.getPrincipal();
        final String expiration = Instant.ofEpochMilli(view.getExpirationTime()).toString();

        return String.format("sessionId: %s%nprincipal name: %s%nemail: %s%nexpiration: %s",
                oidcSessionInformation.getSessionId(), oidcUser.getName(), oidcUser.getEmail(), expiration);
    }
}
