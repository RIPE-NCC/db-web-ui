package net.ripe.whois.external.clients;

import com.google.common.collect.Maps;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.UUID;

@Component
public class WhoisInternalClient extends RestClient {

    private final String apiUrl;
    private final String apiKey;


    @Autowired
    public WhoisInternalClient(@Value("${internal.api.url}") final String apiUrl,  @Value("${internal.api.key}") final String apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    public String getMaintainers(UUID uuid) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("apiKey", apiKey);
        variables.put("uuid", uuid);

        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.add("Content-Type", "application/json");

        return restTemplate.exchange("{apiUrl}/api/user/{uuid}/maintainers?apiKey={apiKey}",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class,
            variables).getBody();
    }

}
