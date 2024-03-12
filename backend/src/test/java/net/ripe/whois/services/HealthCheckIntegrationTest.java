package net.ripe.whois.services;

import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.LoadBalancerEnabler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class HealthCheckIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private LoadBalancerEnabler loadBalancerEnabler;

    @AfterEach
    public void reset() {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.ACCEPTING_TRAFFIC);
        loadBalancerEnabler.up();
    }

    @Test
    public void applicationAcceptingTraffic() {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.ACCEPTING_TRAFFIC);

        final ResponseEntity<String> response = get("/db-web-ui/api/healthcheck", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("OK"));
    }

    @Test
    public void applicationRefusingTraffic() {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.REFUSING_TRAFFIC);

        final ResponseEntity<String> response = get("/db-web-ui/api/healthcheck", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.SERVICE_UNAVAILABLE));
        assertThat(response.getBody(), is("DISABLED"));
    }

    @Test
    public void loadBalancerDown() {
        loadBalancerEnabler.down();

        final ResponseEntity<String> response = get("/db-web-ui/api/healthcheck", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.SERVICE_UNAVAILABLE));
        assertThat(response.getBody(), is("DISABLED"));
    }
}
