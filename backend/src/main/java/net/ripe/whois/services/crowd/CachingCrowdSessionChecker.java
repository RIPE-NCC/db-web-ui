package net.ripe.whois.services.crowd;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Component
@CacheConfig
public class CachingCrowdSessionChecker {
    private static final Logger LOGGER = LoggerFactory.getLogger(CachingCrowdSessionChecker.class);
    private final CrowdClient crowdClient;

    @Autowired
    public CachingCrowdSessionChecker(final CrowdClient crowdClient) {
        this.crowdClient = crowdClient;
    }

    @Cacheable("net.ripe.whois.crowdSessions")
    public boolean isAuthenticated(final String crowdToken) {
        try {
            UserSession userSession = crowdClient.getUserSession(crowdToken);
            LOGGER.debug("Found user session for token {}: {}", crowdToken, userSession);
            return true;
        } catch (CrowdClientException exc) {
            LOGGER.debug("Error getting user session for token {}: {}", crowdToken, exc.getMessage());
        }

        return false;
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
