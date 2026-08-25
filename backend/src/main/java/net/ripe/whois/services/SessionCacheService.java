package net.ripe.whois.services;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
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

    public SessionCacheService(@Lazy HazelcastInstance hazelcastInstance) {
        this.hazelcastInstance = hazelcastInstance;
    }

    /**
     * Keep-alive ping for all active SSE connections.
     */
    public void pingAllEmitters() {
        for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
            final String sessionId = entry.getKey();
            final SseEmitter emitter = entry.getValue();
            try {
                LOGGER.info("Keep-alive failed for sessionId={}", sessionId);
                emitter.send(SseEmitter.event().comment("keep-alive"));
            } catch (IOException e) {
                LOGGER.info("Keep-alive failed for sessionId={}, removing dead emitter: {}", sessionId, e.getMessage());
                emitters.remove(sessionId, emitter);
            }
        }
    }

    public SseEmitter subscribe(final String sessionId) {
        LOGGER.debug("subscribe sessionId={}", sessionId);
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
            LOGGER.debug("no Emitter");
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
     * other session caches and pushes the SSE banner. Idempotent.
     * Token cache is not cleaning up because it is tied to an email, which can be
     * which can be in use by a different device.
     */
    public void removeSessionCaches(final String sessionId) {
        AtomicBoolean guard = cleanupInProgress.computeIfAbsent(sessionId, k -> new AtomicBoolean(false));
        if (!guard.compareAndSet(false, true)) {
            return; // already being cleaned up by another trigger
        }

        try {
            IMap<Object, Object> oidcMap = hazelcastInstance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP);

            oidcMap.remove(sessionId);
            hazelcastInstance.getMap("spring:session:sessions").remove(sessionId);


            LOGGER.debug("Notify session expiration sessionId={}", sessionId);
            notifyExpired(sessionId);

            LOGGER.debug("Removed all session cache entries for sessionId={}", sessionId);
        } finally {
            cleanupInProgress.remove(sessionId);
        }
    }
}
