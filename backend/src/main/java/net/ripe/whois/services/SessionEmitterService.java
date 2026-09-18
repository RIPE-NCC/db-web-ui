package net.ripe.whois.services;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionEmitterService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionEmitterService.class);

    private final HazelcastInstance hazelcastInstance;

    // sessionId -> active SSE connection for that browser expiration banner
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SessionEmitterService(@Lazy HazelcastInstance hazelcastInstance) {
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
                if (!hasValidOidcSession(sessionId)){
                    sendExpireSessionEvent(emitter);
                    return;
                }
                LOGGER.debug("Keep-alive check for sessionId={}", sessionId);
                emitter.send(SseEmitter.event().comment("keep-alive"));
            } catch (IOException e) {
                LOGGER.debug("Keep-alive failed for sessionId={}, removing dead emitter: {}", sessionId, e.getMessage());
                emitters.remove(sessionId, emitter);
                emitter.completeWithError(e);
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
        final SseEmitter emitter = emitters.remove(sessionId);
        if (emitter == null) {
            LOGGER.debug("no Emitter");
            return; // no active tab subscribed for this session — nothing to push
        }
        sendExpireSessionEvent(emitter);
    }

    public SseEmitter removeAndGet(final String sessionId){
        return emitters.remove(sessionId);
    }

    private static @NonNull SseEmitter sendExpireSessionEvent(SseEmitter emitter) {
        try {
            LOGGER.debug("Notifying session expiration");
            emitter.send(SseEmitter.event().name("session-expired").data("expired"));
            emitter.complete();
        } catch (IOException e) {
            LOGGER.debug("Failed to notify session expiration {}", e.getMessage());
            emitter.completeWithError(e);
        }
        return emitter;
    }
}
