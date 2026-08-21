package net.ripe.whois.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionCacheService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionCacheService.class);

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final OidcSessionRegistry oidcSessionRegistry;

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SessionCacheService(final OAuth2AuthorizedClientService authorizedClientService,
                               final OidcSessionRegistry oidcSessionRegistry) {
        this.authorizedClientService = authorizedClientService;
        this.oidcSessionRegistry = oidcSessionRegistry;
    }

    public SseEmitter subscribe(final String sessionId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout — closes only on completion/error
        emitters.put(sessionId, emitter);

        emitter.onCompletion(() -> emitters.remove(sessionId, emitter));
        emitter.onTimeout(() -> emitters.remove(sessionId, emitter));
        emitter.onError((ex) -> emitters.remove(sessionId, emitter));

        return emitter;
    }

    public void notifyExpired(final String sessionId) {
        final SseEmitter emitter = emitters.remove(sessionId);
        if (emitter == null) {
            return; // no active tab subscribed for this session — nothing to push
        }
        try {
            emitter.send(SseEmitter.event().name("session-expired").data("expired"));
            emitter.complete();
        } catch (IOException e) {
            LOGGER.debug("Failed to notify session expiration for {}: {}", sessionId, e.getMessage());
            emitter.completeWithError(e);
        }
    }

    /**
     * Explicitly removes this session's entries from all three Hazelcast caches and pushes
     * the SSE removal event. Must be called BEFORE the HttpSession is invalidated,
     * since the OAuth2AuthorizedClient key requires the current Authentication.
     */
    public void removeAllCaches(final String sessionId, final Authentication authentication) {
        oidcSessionRegistry.removeSessionInformation(sessionId);

        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            final String registrationId = oauthToken.getAuthorizedClientRegistrationId();
            authorizedClientService.removeAuthorizedClient(registrationId, authentication.getName());
            LOGGER.info("Removed authorized client registrationId={} principal={}", registrationId, authentication.getName());
        } else {
            LOGGER.debug("No OAuth2AuthenticationToken present for session={}, skipping authorized-client removal", sessionId);
        }
    }
}
