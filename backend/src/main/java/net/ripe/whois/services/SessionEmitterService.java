package net.ripe.whois.services;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionEmitterService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionEmitterService.class);

    private final HazelcastInstance hazelcastInstance;

    // sessionId -> active SSE connection for each tab expiration banner for a session
    private final Map<String, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SessionEmitterService(@Lazy HazelcastInstance hazelcastInstance) {
        this.hazelcastInstance = hazelcastInstance;
    }

    /**
     * Keep-alive ping for all active SSE connections.
     */
    public void pingAllEmitters() {
        for (final Map.Entry<String, Set<SseEmitter>> entry : emitters.entrySet()) {
            final String sessionId = entry.getKey();

            if (!hasValidOidcSession(sessionId)){
                notifyExpired(sessionId);
                continue;
            }

            entry.getValue().forEach(emitter -> {
                try {
                    LOGGER.debug("Keep-alive check for sessionId={}", sessionId);
                    emitter.send(SseEmitter.event().name("keep-alive").data("1")); //Match "keep-alive" in frontend listener
                } catch (Exception e) {
                    LOGGER.debug("Keep-alive failed for sessionId={}, removing dead emitter: {}", sessionId, e.getMessage());
                    removeEmitter(sessionId, emitter);
                    emitter.completeWithError(e);
                }
            });
        }
    }

    public SseEmitter subscribe(final String sessionId) {
        LOGGER.debug("subscribe sessionId={}", sessionId);
        final SseEmitter emitter = createEmitter(sessionId);

        // add this tab's connection; other tabs of the same session keep their emitter
        emitters.computeIfAbsent(sessionId, id -> ConcurrentHashMap.newKeySet()).add(emitter);

        try {
            emitter.send(SseEmitter.event().name("keep-alive").data("1"));   // immediate first event
        } catch (Exception e) {
            LOGGER.debug("Initial keep-alive failed for sessionId={}: {}", sessionId, e.getMessage());
            removeEmitter(sessionId, emitter);
        }

        return emitter;
    }

    private @NonNull SseEmitter createEmitter(String sessionId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout — closes only on completion/error

        emitter.onCompletion(() -> removeEmitter(sessionId, emitter));
        emitter.onTimeout(() -> removeEmitter(sessionId, emitter));
        emitter.onError(ex -> {
            removeEmitter(sessionId, emitter);
            if (ex instanceof java.util.concurrent.TimeoutException) {
                LOGGER.info("SSE connection for sessionId={} idle-timed out", sessionId);
            } else {
                LOGGER.warn("SSE error for sessionId={}: {}", sessionId, ex.toString());
            }
        });
        return emitter;
    }

    private void removeEmitter(final String sessionId, final SseEmitter emitter) {
        emitters.computeIfPresent(sessionId, (id, set) -> {
            set.remove(emitter);
            return set.isEmpty() ? null : set;    // drop the session entry when its last tab is gone
        });
    }

    public SseEmitter immediatelyExpired() {
        final SseEmitter emitter = new SseEmitter(0L);
        return sendExpireSessionEvent(emitter);
    }

    public boolean hasValidOidcSession(final String sessionId) {
        final IMap<Object, Object> oidcMap = hazelcastInstance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP);
        return oidcMap.containsKey(sessionId);
    }

    public boolean hasActiveEmitter(final String sessionId) {
        return emitters.containsKey(sessionId);
    }

    public void notifyExpired(final String sessionId) {
        final Set<SseEmitter> sessionEmitters = emitters.remove(sessionId);
        if (sessionEmitters == null || sessionEmitters.isEmpty()) return; // no active tab subscribed for this session — nothing to push
        sessionEmitters.forEach(SessionEmitterService::sendExpireSessionEvent);
    }


    public void closeQuietly(final String sessionId) {
        final Set<SseEmitter> sessionEmitters = emitters.remove(sessionId);
        if (sessionEmitters == null || sessionEmitters.isEmpty()) return;
        sessionEmitters.forEach(SessionEmitterService::sendCloseSessionEvent);
    }

    private static void sendCloseSessionEvent(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event().name("session-closed").data("closed"));
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
    }

    private static @NonNull SseEmitter sendExpireSessionEvent(SseEmitter emitter) {
        try {
            LOGGER.debug("Notifying session expiration");
            emitter.send(SseEmitter.event().name("session-expired").data("expired")); //Match "session-expired" in the frontend listener
            emitter.complete();
        } catch (Exception e) {
            LOGGER.debug("Failed to notify session expiration {}", e.getMessage());
            emitter.completeWithError(e);
        }
        return emitter;
    }
}
