package net.ripe.whois.services;

import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.config.CacheConfiguration;
import net.ripe.whois.config.IpRanges;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static com.google.common.net.HttpHeaders.X_FORWARDED_FOR;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class RateLimitCheckIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    IpRanges ipRanges;

    @Autowired
    CacheManager cacheManager;

    @BeforeAll
    public static void setup() {
        System.setProperty("bucket4j.enabled", "true");
        System.setProperty("bucket4j.filters[0].rate-limits[0].bandwidths[0].capacity", "1");
        System.setProperty("bucket4j.filters[0].rate-limits[0].bandwidths[0].time","1");
        System.setProperty("bucket4j.filters[0].rate-limits[0].cache-key","getRemoteAddr()");
        System.setProperty("bucket4j.filters[0].rate-limits[0].bandwidths[0].unit","minutes");
        System.setProperty("bucket4j.filters[0].rate-limits[0].execute-condition","@rateLimitConditionService.applyRateLimit(getRemoteAddr())");
    }

    @AfterAll
    public static void reset() {
        System.setProperty("bucket4j.enabled", "false");
    }

    @BeforeEach
    public void clearCache() {
        cacheManager.getCache(CacheConfiguration.RATE_LIMIT_BUCKETS_CACHE).clear();
    }

    @Test
    public void shouldUseXforwardedIpForRateLimiting() {
        ipRanges.setTrusted("127.0.0.1","::1");

        ResponseEntity<String> response = get("/db-web-ui/api/healthcheck", String.class, xForwardedFor(List.of("10.0.0.0")));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("OK"));

        response = get("/db-web-ui/api/healthcheck", String.class, xForwardedFor(List.of("10.0.0.0")));
        assertThat(response.getStatusCode(), is(HttpStatus.TOO_MANY_REQUESTS));

        response = get("/db-web-ui/api/healthcheck", String.class, xForwardedFor(List.of("20.0.0.0")));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("OK"));
    }

    @Test
    public void shouldUseRemoteAddrIfHeaderIsNotPresent() {
        ipRanges.setTrusted("193.0.20.230");

        ResponseEntity<String> response = get("/db-web-ui/api/healthcheck", String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("OK"));

        response = get("/db-web-ui/api/healthcheck", String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.TOO_MANY_REQUESTS));
    }

    @Test
    public void shouldNotRejectRequestsFromTrustedSource() {
        ipRanges.setTrusted("127.0.0.1","::1");

        ResponseEntity<String> response = get("/db-web-ui/api/healthcheck", String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("OK"));

        response = get("/db-web-ui/api/healthcheck", String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("OK"));
    }

    private HttpEntity<String> xForwardedFor(final List<String> hosts) {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.addAll(X_FORWARDED_FOR, hosts);
        return new HttpEntity<>(null, requestHeaders);
    }
}
