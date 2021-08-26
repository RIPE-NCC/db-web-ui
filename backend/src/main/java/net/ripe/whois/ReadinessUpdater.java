package net.ripe.whois;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.ApplicationContext;
import org.springframework.jmx.export.annotation.ManagedOperation;
import org.springframework.jmx.export.annotation.ManagedResource;
import org.springframework.stereotype.Component;

@Component
@ManagedResource(objectName = "net.ripe.db.whois:name=ReadinessUpdater", description = "Mark services as ready to receive traffic or not")
public class ReadinessUpdater {

    final private ApplicationContext applicationContext;

    @Autowired
    public ReadinessUpdater(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @ManagedOperation
    public void up(){
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.ACCEPTING_TRAFFIC);
    }

    @ManagedOperation
    public void down() {
        AvailabilityChangeEvent.publish(applicationContext, ReadinessState.REFUSING_TRAFFIC);
    }
}
