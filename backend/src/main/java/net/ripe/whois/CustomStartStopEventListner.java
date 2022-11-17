package net.ripe.whois;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component("customStartStopEventListner")
public class CustomStartStopEventListner {

    final private LoadBalancerEnabler loadBalancerEnabler;

    @Value("${shutdown.pause.sec}")
    private int preShutdownPause;

    @Autowired
    public CustomStartStopEventListner(final LoadBalancerEnabler loadBalancerEnabler) {
        this.loadBalancerEnabler = loadBalancerEnabler;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void onApplicationEvent(ContextRefreshedEvent event) {
        loadBalancerEnabler.up();
    }

    //This will disable load balancer health check and wait for 10 seconds before graceful shutdown commences
    //This will make sure we do not loose any traffic in between spring shutdown and load balancer health check api call
    @EventListener(ContextClosedEvent.class)
    public void onContextClosedEvent() throws InterruptedException {
        loadBalancerEnabler.down();
        Thread.sleep(this.preShutdownPause * 1000L);
    }
}
