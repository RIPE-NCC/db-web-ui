package net.ripe.whois;

import net.ripe.whois.services.SessionCacheService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Keep alive Server-Sent Events (SSE) connections.
 */
@Component
public class SseKeepAliveScheduler {
    
    private final SessionCacheService sessionCacheService;

    public SseKeepAliveScheduler(SessionCacheService sessionCacheService) {
        this.sessionCacheService = sessionCacheService;
    }

    @Scheduled(fixedRate = 60_000)
    public void ping() {
        sessionCacheService.pingAllEmitters();
    }
}
