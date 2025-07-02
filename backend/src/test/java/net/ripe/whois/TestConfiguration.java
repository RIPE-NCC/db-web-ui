package net.ripe.whois;

import org.springframework.boot.http.client.ClientHttpRequestFactorySettings;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Properties;

@Configuration
public class TestConfiguration {

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
