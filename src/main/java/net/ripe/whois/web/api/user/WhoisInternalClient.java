package net.ripe.whois.web.api.user;

import com.google.common.collect.Maps;
import net.ripe.whois.web.api.whois.RestResponseErrorHandler;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;

@Component
public class WhoisInternalClient {

    private final String apiUrl;
    private final String apiKey;
    private final RestTemplate restTemplate;

    @Autowired
    public WhoisInternalClient(@Value("${internal.api.url}") final String apiUrl,  @Value("${internal.api.key}") final String apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.restTemplate = createRestTemplate();
    }

    public ResponseEntity<String> getMaintainers(String uuid) {
        final HashMap<String, String> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("apiKey", apiKey);
        variables.put("uuid", uuid);
        return restTemplate.getForEntity(
            "{apiUrl}/api/user/{uuid}/maintainers?apiKey={apiKey}",
            String.class,
            variables);
    }

    private RestTemplate createRestTemplate() {
        final CloseableHttpClient httpClient = HttpClientBuilder.create().build();
        final ClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory(httpClient);
        final RestTemplate restTemplate = new RestTemplate(requestFactory);
        restTemplate.setErrorHandler(new RestResponseErrorHandler());
        return restTemplate;
    }

}
