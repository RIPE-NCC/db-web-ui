package net.ripe.whois;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Properties;

@Configuration
public class TestConfiguration {

    @Bean
    public FilterRegistrationBean<Filter> csrfCookieForcingFilter() {
        final FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain) throws ServletException, IOException {
                final CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
                if (token != null) {
                    token.getToken(); // forces resolution -> Set-Cookie written
                }
                chain.doFilter(request, response);
            }
        });
        registration.setOrder(Integer.MAX_VALUE); // run after Spring Security's chain
        return registration;
    }

    @Bean
    public BuildProperties buildProperties() {
        final Properties properties = new Properties();
        properties.setProperty("time", "1");
        return new BuildProperties(properties);
    }

    @Bean
    public RestTemplateBuilder restTemplateBuilder() {
        return new RestTemplateBuilder().redirects(ClientHttpRequestFactorySettings.Redirects.DONT_FOLLOW);
    }

}
