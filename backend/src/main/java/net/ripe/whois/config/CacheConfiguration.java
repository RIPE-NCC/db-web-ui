package net.ripe.whois.config;

import com.giffing.bucket4j.spring.boot.starter.config.cache.SyncCacheResolver;
import com.giffing.bucket4j.spring.boot.starter.config.cache.jcache.JCacheCacheResolver;
import com.github.benmanes.caffeine.jcache.configuration.CaffeineConfiguration;
import com.github.benmanes.caffeine.jcache.spi.CaffeineCachingProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.cache.CacheManager;
import javax.cache.spi.CachingProvider;
import java.time.Duration;
import java.util.OptionalLong;

@Configuration
public class CacheConfiguration {

    public static final String RESOURCE_TICKET_MEMBER_CACHE = "resource-ticket-member";
    public static final String RESOURCE_TICKET_MEMBER_AND_RESOURCE_CACHE = "resource-ticket-member-resource";
    public static final String SSO_SESSIONS_CACHE = "sso-sessions";
    public static final String RATE_LIMIT_BUCKETS_CACHE = "buckets";

    @Autowired
    private ApplicationContext applicationContext;

    @Bean
    public SyncCacheResolver bucket4jCacheResolver() {
        return new JCacheCacheResolver(applicationContext.getBean(CacheManager.class));
    }

    @Bean
    public CachingProvider cachingProvider() {
        return new CaffeineCachingProvider();
    }

    @Bean
    public CacheManager getCacheManager() {
        final CachingProvider cachingProvider = applicationContext.getBean(CachingProvider.class);
        javax.cache.CacheManager cacheManager = cachingProvider.getCacheManager();
        cacheManager.createCache(RATE_LIMIT_BUCKETS_CACHE, rateLimitBucketsConfiguration());
        cacheManager.createCache(SSO_SESSIONS_CACHE, ssoSessionsCongiguration());
        cacheManager.createCache(RESOURCE_TICKET_MEMBER_CACHE, resourceTicketConfiguration());
        cacheManager.createCache(RESOURCE_TICKET_MEMBER_AND_RESOURCE_CACHE, resourceTicketConfiguration());
        return cacheManager;
    }

    private CaffeineConfiguration<Object, Object> rateLimitBucketsConfiguration() {
        final CaffeineConfiguration<Object, Object> configuration = new CaffeineConfiguration<>();
        configuration.setExpireAfterWrite(OptionalLong.of(Duration.ofHours(1).toNanos()));
        configuration.setMaximumSize(OptionalLong.of(1_000_000L));
        return configuration;
    }

    private CaffeineConfiguration<Object, Object> ssoSessionsCongiguration() {
        final CaffeineConfiguration<Object, Object> configuration = new CaffeineConfiguration<>();
        configuration.setExpireAfterWrite(OptionalLong.of(Duration.ofMinutes(10).toNanos()));
        configuration.setExpireAfterAccess(OptionalLong.of(Duration.ofMinutes(5).toNanos()));
        configuration.setMaximumSize(OptionalLong.of(1_000_000L));
        return configuration;
    }

    private CaffeineConfiguration<Object, Object> resourceTicketConfiguration() {
        final CaffeineConfiguration<Object, Object> configuration = new CaffeineConfiguration<>();
        configuration.setExpireAfterWrite(OptionalLong.of(Duration.ofMinutes(10).toNanos()));
        configuration.setExpireAfterAccess(OptionalLong.of(Duration.ofMinutes(5).toNanos()));
        configuration.setMaximumSize(OptionalLong.of(1_000_000L));
        return configuration;
    }

}
