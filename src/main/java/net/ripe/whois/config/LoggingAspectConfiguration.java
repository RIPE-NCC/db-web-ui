package net.ripe.whois.config;

import net.ripe.whois.aop.logging.LoggingAspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Profile;

@Configuration
@EnableAspectJAutoProxy
public class LoggingAspectConfiguration {

    private final LoggingAspect loggingAspect;

    @Autowired
    public LoggingAspectConfiguration(final LoggingAspect loggingAspect) {
        this.loggingAspect = loggingAspect;
    }

    @Bean
    @Profile({Constants.SPRING_PROFILE_DEVELOPMENT, Constants.SPRING_PROFILE_PREPDEV})
    public LoggingAspect loggingAspect() {
        return loggingAspect;
    }
}
