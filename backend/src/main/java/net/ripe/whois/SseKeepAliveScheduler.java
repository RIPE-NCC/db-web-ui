package net.ripe.whois;

import net.ripe.whois.services.SessionCacheService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Keep alive Server-Sent Events (SSE) connections.
 */
@Component
public class SseKeepAliveScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(SseKeepAliveScheduler.class);

    private final SessionCacheService sessionCacheService;

    public SseKeepAliveScheduler(SessionCacheService sessionCacheService) {
        this.sessionCacheService = sessionCacheService;
    }

    @Scheduled(fixedRate = 60_000)
    public void ping() {
        LOGGER.info("SSE keep-alive tick, active emitters={}", sessionCacheService.emitters.size());
        sessionCacheService.pingAllEmitters();
    }
}
