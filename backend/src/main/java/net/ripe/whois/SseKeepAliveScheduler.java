package net.ripe.whois;

import net.ripe.whois.services.SessionEmitterService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Keep alive Server-Sent Events (SSE) connections.
 */
@Component
public class SseKeepAliveScheduler {

    private final SessionEmitterService sessionEmitterService;

    public SseKeepAliveScheduler(final SessionEmitterService sessionEmitterService) {
        this.sessionEmitterService = sessionEmitterService;
    }

    @Scheduled(fixedRate = 60_000)
    public void ping() {
        sessionEmitterService.pingAllEmitters();
    }
}
