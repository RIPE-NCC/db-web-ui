package net.ripe.whois.services;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import net.ripe.whois.config.OidcUtils;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class SessionCacheService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionCacheService.class);

    private final HazelcastInstance hazelcastInstance;
    private final SessionEmitterService sessionEmitterService;

    // guards against double-cleanup if two triggers fire for the same session close together
    private final Map<String, AtomicBoolean> cleanupInProgress = new ConcurrentHashMap<>();

    public SessionCacheService(final @Lazy HazelcastInstance hazelcastInstance,
                               final SessionEmitterService sessionEmitterService) {
        this.hazelcastInstance = hazelcastInstance;
        this.sessionEmitterService = sessionEmitterService;
    }


    // --- Cross-cache removal ---
    /**
     * Called whenever a session disappears from any of the three Hazelcast caches
     * (natural idle-timeout expiry, or explicit /invalidate). Removes it from the
     * other session caches and pushes the SSE banner. Idempotent.
     * Token cache is not cleaning up because it is tied to an email, which can be
     * which can be in use by a different device.
     */
    public void cleanUpSessionCachesAndEmitters(final String sessionId, final boolean shouldNotify) {
        AtomicBoolean guard = cleanupInProgress.computeIfAbsent(sessionId, k -> new AtomicBoolean(false));
        if (!guard.compareAndSet(false, true)) {
            return; // already being cleaned up by another trigger
        }


        try {
            IMap<Object, Object> oidcMap = hazelcastInstance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP);

            oidcMap.remove(sessionId);
            hazelcastInstance.getMap(OidcUtils.HTTP_SESSION_CACHE).remove(sessionId);

            LOGGER.debug("Notify session expiration sessionId={}", sessionId);
            if (shouldNotify) {
                sessionEmitterService.notifyExpired(sessionId);
            }
            final SseEmitter emitter = sessionEmitterService.removeAndGet(sessionId);
            if (emitter != null){
                LOGGER.debug("Removed all session cache entries for sessionId={}, closing emitter", sessionId);
                emitter.complete();
            }
            LOGGER.debug("Removed all session cache entries for sessionId={}", sessionId);
        } finally {
            cleanupInProgress.remove(sessionId);
        }
    }
}
