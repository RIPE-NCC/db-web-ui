package net.ripe.whois.services;

import net.ripe.whois.config.CacheConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Component
public class CachingSessionChecker {
    private static final Logger LOGGER = LoggerFactory.getLogger(CachingSessionChecker.class);

    private final WhoisInternalService whoisInternalService;

    @Autowired
    public CachingSessionChecker(final WhoisInternalService whoisInternalService) {
        this.whoisInternalService = whoisInternalService;
    }

    @Cacheable(CacheConfiguration.SSO_SESSIONS_CACHE)
    public boolean hasActiveToken(final String ssoToken, final String clientIp) {
        return whoisInternalService.getActiveToken(ssoToken, clientIp);
    }

    @CacheEvict(CacheConfiguration.SSO_SESSIONS_CACHE)
    public void markNotAuthenticated(final String ssoToken) {
        LOGGER.debug("markNotAuthenticated:{}", ssoToken);
    }

    @CacheEvict(value = CacheConfiguration.SSO_SESSIONS_CACHE, allEntries = true)
    public void markAllNotAuthenticated() {
        LOGGER.debug("markAllAuthenticated:{}");
    }
}
