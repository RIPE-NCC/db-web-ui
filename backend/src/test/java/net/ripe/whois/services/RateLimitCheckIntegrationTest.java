package net.ripe.whois.services;

import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.config.IpRanges;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static com.google.common.net.HttpHeaders.X_FORWARDED_FOR;
import org.springframework.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class RateLimitCheckIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    IpRanges ipRanges;

    @BeforeAll
    public static void setup() {
        System.setProperty("bucket4j.filters[0].cache-name", "rate-limit-buckets");
        System.setProperty("bucket4j.enabled", "true");

        System.setProperty("bucket4j.filters[0].rate-limits[0].bandwidths[0].capacity", "1");
        System.setProperty("bucket4j.filters[0].rate-limits[0].bandwidths[0].time","1");
        System.setProperty("bucket4j.filters[0].rate-limits[0].expression","getRemoteAddr()");
        System.setProperty("bucket4j.filters[0].rate-limits[0].bandwidths[0].unit","minutes");
        System.setProperty("bucket4j.filters[0].rate-limits[0].execute-condition","@rateLimitConditionService.applyRateLimit(getRemoteAddr())");
    }

    @AfterAll
    public static void reset() {
        System.setProperty("bucket4j.enabled", "false");
    }

    @Test
    public void shouldUseXforwardedIpForRateLimiting() {
        ipRanges.setTrusted("127.0.0.1","::1");

        ResponseEntity response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, getHttpEntity(List.of("10.0.0.0", "20.0.0.0")), String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().toString(), is("OK"));

        response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, getHttpEntity(List.of("10.0.0.0", "20.0.0.0")), String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.TOO_MANY_REQUESTS));


        response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, getHttpEntity(List.of("10.0.0.0")), String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().toString(), is("OK"));

    }

    @Test
    public void shouldUseRemoteAddrIfHeaderIsNotPresent() {
        ipRanges.setTrusted("193.0.20.230");

         ResponseEntity response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().toString(), is("OK"));

        response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.TOO_MANY_REQUESTS));
    }

    @Test
    public void shouldNotRejectRequestsFromTrustedSource() {
        ipRanges.setTrusted("127.0.0.1","::1");

        ResponseEntity response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().toString(), is("OK"));

        response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().toString(), is("OK"));
    }

    private HttpEntity getHttpEntity(final List<String> hosts) {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.addAll(X_FORWARDED_FOR, hosts);
        return new HttpEntity<>(null, requestHeaders);
    }
}
