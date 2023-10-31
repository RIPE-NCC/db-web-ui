package net.ripe.whois.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.jakarta.xmlbind.JakartaXmlBindAnnotationModule;
import com.google.common.net.HttpHeaders;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.core5.http.ConnectionReuseStrategy;
import org.apache.hc.core5.http.Header;
import org.apache.hc.core5.http.HttpRequest;
import org.apache.hc.core5.http.HttpResponse;
import org.apache.hc.core5.http.message.BasicHeader;
import org.apache.hc.core5.http.protocol.HttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@SuppressWarnings("UnusedDeclaration")
public class RestTemplateConfiguration {

    private static final Logger LOGGER = LoggerFactory.getLogger(RestTemplateConfiguration.class);

    // Socket timeout (in ms) until a connection is established. Default is undefined (system default).
    private static final long HTTPCLIENT_CONNECT_TIMEOUT = 5 * 1_000;

    // Socket timeout (in ms). Default is undefined (system default).
    private static final int HTTPCLIENT_READ_TIMEOUT = 5 * 60 * 1_000;

    // Total maximum client connections in pool. Default is 20.
    private static final int HTTPCLIENT_TOTAL_MAX_CONNECTIONS = 200;

    @Bean
    public RestTemplate restTemplate() {
        final RestTemplate restTemplate = new RestTemplate(httpRequestFactory());
        restTemplate.getMessageConverters().removeIf(httpMessageConverter -> httpMessageConverter instanceof StringHttpMessageConverter);
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        restTemplate.getMessageConverters().removeIf(httpMessageConverter -> httpMessageConverter instanceof MappingJackson2HttpMessageConverter);
        restTemplate.getMessageConverters().add(1, mappingJackson2HttpMessageConverter());

        return restTemplate;
    }

    private MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper());
        return converter;
    }

    private ObjectMapper objectMapper() {
        return new ObjectMapper()
            .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
            .configure(DeserializationFeature.UNWRAP_ROOT_VALUE, false)
            .registerModule(new JakartaXmlBindAnnotationModule());
    }

    @Bean
    public ClientHttpRequestFactory httpRequestFactory() {
        return new HttpComponentsClientHttpRequestFactory(httpClient());
    }

    @Bean
    public HttpClient httpClient() {
        final ConnectionConfig connectionConfig = ConnectionConfig.custom()
                                                    .setConnectTimeout(HTTPCLIENT_CONNECT_TIMEOUT, TimeUnit.MILLISECONDS)   // long?
                                                    .setSocketTimeout(HTTPCLIENT_READ_TIMEOUT, TimeUnit.MILLISECONDS)       // int ??
                                                    .build();

        final PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setDefaultConnectionConfig(connectionConfig);     // not a builder pattern?
        connectionManager.setMaxTotal(HTTPCLIENT_TOTAL_MAX_CONNECTIONS);

        final RequestConfig requestConfig = RequestConfig.custom()
                                                .setConnectionRequestTimeout(HTTPCLIENT_CONNECT_TIMEOUT, TimeUnit.MILLISECONDS)
                                                .setConnectTimeout(HTTPCLIENT_CONNECT_TIMEOUT, TimeUnit.MILLISECONDS)
                                                .build();

        final List<Header> headers = new ArrayList<>();
        headers.add(new BasicHeader(HttpHeaders.CONNECTION, "close"));

        return HttpClients.custom()
                .setDefaultHeaders(headers)
                .setConnectionReuseStrategy(
                        new ConnectionReuseStrategy() {
                            @Override
                            public boolean keepAlive(HttpRequest httpRequest, HttpResponse httpResponse, HttpContext httpContext) {
                                return false;
                            }
                        }

                ) // always close connection immediately as keepalive / reuse causes timeouts in production
                .setDefaultRequestConfig(requestConfig)
                .setConnectionManager(connectionManager)
                .build();
    }

}
