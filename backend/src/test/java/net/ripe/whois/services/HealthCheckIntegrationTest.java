package net.ripe.whois.services;

import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.LoadBalancerEnabler;
import org.junit.After;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class HealthCheckIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private LoadBalancerEnabler loadBalancerEnabler;

    @After
    public void reset() {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.ACCEPTING_TRAFFIC);
        loadBalancerEnabler.up();
    }

    @Test
    public void testHealthyLBEnabled() {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.ACCEPTING_TRAFFIC);

        final ResponseEntity response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().toString(), is("OK"));
    }

    @Test
    public void testHealthyLBDisabled() {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.REFUSING_TRAFFIC);

        final ResponseEntity response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.SERVICE_UNAVAILABLE));
        assertThat(response.getBody().toString(), is("DISABLED"));
    }

    @Test
    public void testHealthyLBDisabledWhenLoadBalncerDisabled() {
        loadBalancerEnabler.down();

        final ResponseEntity response =
            restTemplate.exchange(getServerUrl() + "/db-web-ui/api/healthcheck", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.SERVICE_UNAVAILABLE));
        assertThat(response.getBody().toString(), is("DISABLED"));
    }
}
