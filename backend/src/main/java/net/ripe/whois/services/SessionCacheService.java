package net.ripe.whois.services;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import net.ripe.whois.config.hazelcast.HazelcastOAuth2AuthorizedClientService;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class SessionCacheService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionCacheService.class);

    private final HazelcastInstance hazelcastInstance;

    // sessionId -> active SSE connection for that browser expiration banner
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    // guards against double-cleanup if two triggers fire for the same session close together
    private final Map<String, AtomicBoolean> cleanupInProgress = new ConcurrentHashMap<>();

    public SessionCacheService(HazelcastInstance hazelcastInstance) {
        this.hazelcastInstance = hazelcastInstance;
    }

    /**
     * The set of sessionIds that currently have a live SSE connection open —
     * i.e. a browser tab is actually present and listening for the removal banner.
     * SessionLivenessJob uses this to know which sessions are worth checking against
     * Keycloak; there's no point polling for a session nobody has open anymore.
     */
    public Set<String> getSubscribedSessionIds() {
        return Set.copyOf(emitters.keySet());
    }

    public SseEmitter subscribe(final String sessionId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout — closes only on completion/error
        emitters.put(sessionId, emitter);

        emitter.onCompletion(() -> emitters.remove(sessionId, emitter));
        emitter.onTimeout(() -> emitters.remove(sessionId, emitter));
        emitter.onError((ex) -> emitters.remove(sessionId, emitter));

        return emitter;
    }

    private void notifyExpired(final String sessionId) {
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

    // --- Cross-cache removal ---

    /**
     * Called whenever a session disappears from any of the three Hazelcast caches
     * (natural idle-timeout expiry, or explicit /invalidate). Removes it from the
     * other two caches and pushes the SSE banner. Idempotent.
     */
    public void removeAllCaches(final String sessionId, final boolean notify) {
        AtomicBoolean guard = cleanupInProgress.computeIfAbsent(sessionId, k -> new AtomicBoolean(false));
        if (!guard.compareAndSet(false, true)) {
            return; // already being cleaned up by another trigger
        }

        try {
            IMap<Object, Object> oidcMap = hazelcastInstance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP);
            Object oidcEntry = oidcMap.get(sessionId);

            if (oidcEntry instanceof OidcSessionInformation info) {
                String key = "keycloak:" + info.getPrincipal().getName();
                hazelcastInstance.getMap(HazelcastOAuth2AuthorizedClientService.MAP_NAME).remove(key);
                LOGGER.info("Removed authorized-client key={} for sessionId={}", key, sessionId);
            }

            oidcMap.remove(sessionId);
            hazelcastInstance.getMap("spring:session:sessions").remove(sessionId);

            if (notify) {
                notifyExpired(sessionId);
            }
            LOGGER.info("Removed all cache entries for sessionId={}", sessionId);
        } finally {
            cleanupInProgress.remove(sessionId);
        }
    }
}
