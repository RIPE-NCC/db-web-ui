package net.ripe.whois.config;

import net.ripe.whois.aop.logging.LoggingAspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

// TODO: [ES] constructor autowiring doesn't work here
@Configuration
@EnableAspectJAutoProxy
@Component
public class LoggingAspectConfiguration {

    @Autowired
    private LoggingAspect loggingAspect;

    @Bean
    @Profile({Constants.SPRING_PROFILE_DEVELOPMENT, Constants.SPRING_PROFILE_PREPDEV, Constants.SPRING_PROFILE_RC})
    public LoggingAspect loggingAspect() {
        return loggingAspect;
    }
}
