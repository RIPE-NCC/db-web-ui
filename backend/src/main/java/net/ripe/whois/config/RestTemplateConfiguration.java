package net.ripe.whois.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationModule;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.DefaultClientConnectionReuseStrategy;
import org.apache.http.impl.client.DefaultConnectionKeepAliveStrategy;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.Charset;
import java.util.concurrent.TimeUnit;

@Configuration
@SuppressWarnings("UnusedDeclaration")
public class RestTemplateConfiguration {

    // Socket timeout (in ms) until a connection is established. Default is undefined (system default).
    private static final int HTTPCLIENT_CONNECT_TIMEOUT = 5 * 1_000;

    // Socket timeout (in ms). Default is undefined (system default).
    private static final int HTTPCLIENT_READ_TIMEOUT = 5 * 60 * 1_000;

    // Total maximum client connections in pool. Default is 20.
    private static final int HTTPCLIENT_TOTAL_MAX_CONNECTIONS = 200;

    // Maximum client connections per route in pool. Default is 2.
    private static final int HTTPCLIENT_MAX_CONNECTIONS_PER_ROUTE = 25;

    // Maximum time (in ms) persistent connections can stay idle while kept alive in the connection pool.
    private static final int HTTPCLIENT_MAX_IDLE_TIME = 25 * 1_000;

    private static final RequestConfig DEFAULT_REQUEST_CONFIG = RequestConfig.custom()
                                                                    .setConnectionRequestTimeout(HTTPCLIENT_CONNECT_TIMEOUT)
                                                                    .setConnectTimeout(HTTPCLIENT_CONNECT_TIMEOUT)
                                                                    .setSocketTimeout(HTTPCLIENT_READ_TIMEOUT)
                                                                    .build();

    @Bean
    public RestTemplate restTemplate() {
        final RestTemplate restTemplate = new RestTemplate(httpRequestFactory());

        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(Charset.forName("UTF-8")));

        for (HttpMessageConverter<?> httpMessageConverter : restTemplate.getMessageConverters()) {
            if (httpMessageConverter instanceof MappingJackson2HttpMessageConverter) {
                final ObjectMapper objectMapper = ((MappingJackson2HttpMessageConverter) httpMessageConverter).getObjectMapper();
                objectMapper.registerModule(new JaxbAnnotationModule());
            }
        }

        return restTemplate;
    }

    @Bean
    public ClientHttpRequestFactory httpRequestFactory() {
        return new HttpComponentsClientHttpRequestFactory(httpClient());
    }

    @Bean
    public HttpClient httpClient() {
        return HttpClientBuilder.create()
                .setConnectionReuseStrategy(DefaultClientConnectionReuseStrategy.INSTANCE)
                .setKeepAliveStrategy(DefaultConnectionKeepAliveStrategy.INSTANCE)
                .evictExpiredConnections()
                .evictIdleConnections(HTTPCLIENT_MAX_IDLE_TIME, TimeUnit.MILLISECONDS)
                .setDefaultRequestConfig(DEFAULT_REQUEST_CONFIG)
                .setMaxConnTotal(HTTPCLIENT_TOTAL_MAX_CONNECTIONS)
                .setMaxConnPerRoute(HTTPCLIENT_MAX_CONNECTIONS_PER_ROUTE)
                .build();
    }

}
