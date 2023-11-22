package net.ripe.whois;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;


@Configuration
public class ApplicationSecurity {

    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
        // Security handled in SsoTokenFilter
        return http
            .csrf(config -> config.disable())
            .authorizeHttpRequests((authorize) -> authorize.anyRequest().permitAll())
            .build();
    }

    @Bean
    public HttpFirewall allowUrlEncodedPercentHttpFirewall() {
        final StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedPercent(true);
        firewall.setAllowUrlEncodedSlash(true);
        return firewall;
    }

}
