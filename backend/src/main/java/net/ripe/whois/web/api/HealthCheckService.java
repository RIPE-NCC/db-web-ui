package net.ripe.whois.web.api;

import net.ripe.whois.LoadBalancerEnabler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

import static javax.ws.rs.core.HttpHeaders.CACHE_CONTROL;

/**
 * This endpoint is used by load balancer to check if application is ready to accept traffic or not
 */
@RestController
public class HealthCheckService extends ApiController {

    private ApplicationAvailability applicationAvailability;
    private final LoadBalancerEnabler loadBalancerEnabler;

    @Autowired
    public HealthCheckService(final ApplicationAvailability applicationAvailability, final LoadBalancerEnabler loadBalancerEnabler) {
        this.applicationAvailability = applicationAvailability;
        this.loadBalancerEnabler = loadBalancerEnabler;
    }

    @RequestMapping(value = "/api/healthcheck", method = {RequestMethod.GET, RequestMethod.HEAD}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity check(HttpServletResponse response) {
        response.setHeader(CACHE_CONTROL, "no-cache"); // deliberately overrides CacheFilter

        return (loadBalancerEnabler.isEnabled() && isAcceptingTraffic()) ? new ResponseEntity<>("OK", HttpStatus.OK) :
                                                        new ResponseEntity<>("DISABLED", HttpStatus.SERVICE_UNAVAILABLE);
    }

    private boolean isAcceptingTraffic() {
        return applicationAvailability.getReadinessState() == ReadinessState.ACCEPTING_TRAFFIC;
    }
}
