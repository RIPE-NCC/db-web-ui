package net.ripe.whois.services.crowd;

import net.ripe.whois.services.WhoisInternalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Component
public class CachingCrowdSessionChecker {
    private static final Logger LOGGER = LoggerFactory.getLogger(CachingCrowdSessionChecker.class);

    private final WhoisInternalService whoisInternalService;

    @Autowired
    public CachingCrowdSessionChecker(final WhoisInternalService whoisInternalService) {
        this.whoisInternalService = whoisInternalService;
    }

    @Cacheable("net.ripe.whois.crowdSessions")
    public boolean hasActiveToken(final String crowdToken, String clientIp) {
        return whoisInternalService.getActiveToken(crowdToken, clientIp);
    }

    @CacheEvict("net.ripe.whois.crowdSessions")
    private void markNotAuthenticated(final String crowdToken) {
        LOGGER.debug("markNotAuthenticated:{}", crowdToken);
    }

    @CacheEvict(value = "net.ripe.whois.crowdSessions", allEntries = true)
    private void markAllNotAuthenticated() {

        LOGGER.debug("markAllAuthenticated:{}");
    }
}
