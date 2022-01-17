package net.ripe.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LoadBalancerEnabler {
    private static final Logger LOGGER = LoggerFactory.getLogger(LoadBalancerEnabler.class);
    private boolean isEnabled = true;

    public void up() {
        this.isEnabled = true;
        LOGGER.info("marked service as OK for load balancer health check");
    }

    public void down() {
        this.isEnabled = false;
        LOGGER.info("marked service as DISABLED for load balancer health check");
    }

    public boolean isEnabled() {
        return isEnabled;
    }
}
