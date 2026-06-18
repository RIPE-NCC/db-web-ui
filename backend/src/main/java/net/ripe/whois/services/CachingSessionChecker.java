package net.ripe.whois.services;

import net.ripe.whois.config.CacheConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Component
public class CachingSessionChecker {
    private final WhoisInternalService whoisInternalService;

    @Autowired
    public CachingSessionChecker(final WhoisInternalService whoisInternalService) {
        this.whoisInternalService = whoisInternalService;
    }

    // only cache if the token is active
//    @Cacheable(value = CacheConfiguration.SSO_SESSIONS_CACHE, unless = "#result == false")
//    public boolean hasActiveToken(final String ssoToken, final String clientIp) {
//        return whoisInternalService.getActiveToken(ssoToken, clientIp);
//    }
}
