package net.ripe.whois.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionExpirationNotifier {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionExpirationNotifier.class);

    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(final String sessionId) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout — closes only on completion/error
        emitters.put(sessionId, emitter);

        emitter.onCompletion(() -> emitters.remove(sessionId, emitter));
        emitter.onTimeout(() -> emitters.remove(sessionId, emitter));
        emitter.onError((ex) -> emitters.remove(sessionId, emitter));

        return emitter;
    }

    public void notifyExpired(final String sessionId) {
        SseEmitter emitter = emitters.remove(sessionId);
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
}
