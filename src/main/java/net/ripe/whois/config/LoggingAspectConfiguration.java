package net.ripe.whois.config;

import net.ripe.whois.aop.logging.LoggingAspect;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Profile;

@Configuration
@EnableAspectJAutoProxy
public class LoggingAspectConfiguration {

    @Bean
    @Profile({Constants.SPRING_PROFILE_DEVELOPMENT, Constants.SPRING_PROFILE_PREPDEV})
    public LoggingAspect loggingAspect() {
        return new LoggingAspect();
    }
}