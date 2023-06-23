package net.ripe.whois.services;

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

    @Cacheable("net.ripe.whois.ssoSessions")
    public boolean hasActiveToken(final String ssoToken, String clientIp) {
        return whoisInternalService.getActiveToken(ssoToken, clientIp);
    }

    @CacheEvict("net.ripe.whois.ssoSessions")
    private void markNotAuthenticated(final String ssoToken) {
        LOGGER.debug("markNotAuthenticated:{}", ssoToken);
    }

    @CacheEvict(value = "net.ripe.whois.ssoSessions", allEntries = true)
    private void markAllNotAuthenticated() {
        LOGGER.debug("markAllAuthenticated:{}");
    }
}
