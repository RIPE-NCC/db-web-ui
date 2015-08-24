package net.ripe.whois.services.rest;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

public abstract class RestClient {

    protected final RestTemplate restTemplate = createRestTemplate();

    private RestTemplate createRestTemplate() {
        final CloseableHttpClient httpClient = HttpClientBuilder.create().build();
        final ClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory(httpClient);
        final RestTemplate restTemplate = new RestTemplate(requestFactory);
        restTemplate.setErrorHandler(new RestResponseErrorHandler());
        return restTemplate;
    }
}