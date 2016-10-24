package net.ripe.whois.services;

import com.google.common.collect.Maps;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriTemplate;

import java.net.URI;
import java.util.HashMap;

@Service
public class WhoisReferencesService {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisReferencesService.class);

    private static final int MAX_RESULT_NUMBER = 5;

    private final RestTemplate restTemplate;
    private final String referencesApiUrl;

    @Autowired
    public WhoisReferencesService(final RestTemplate restTemplate, @Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.restTemplate = restTemplate;
        this.referencesApiUrl = ripeUrl + "/references";
    }

    public ResponseEntity<String> getReferences(String source, String objectType, String objectName, Integer limit, HttpHeaders headers) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", referencesApiUrl);
        variables.put("source", source);
        variables.put("object-type", objectType);
        variables.put("name", objectName);
        variables.put("limit", limit != null ? limit : MAX_RESULT_NUMBER);

        URI uri = new UriTemplate("{url}/{source}/{object-type}/{name}?limit={limit}").expand(variables);

        LOGGER.debug("Performing fetch {}", uri.toString() );

        return restTemplate.exchange(uri,
            HttpMethod.GET,
            new HttpEntity<String>(headers),
            String.class);
    }


    public ResponseEntity<String> createReferencedObjects( final String source, final String body, final HttpHeaders headers) {
        final String url = "{url}/{source}";

        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", referencesApiUrl);
        variables.put("source", source);

        URI uri = new UriTemplate(url).expand(variables);

        LOGGER.debug("Performing create {}", uri.toString() );

        return restTemplate.exchange(uri,
            HttpMethod.POST,
            new HttpEntity<>(body, headers),
            String.class);
    }

    public ResponseEntity<String> deleteObjectAndReferences(final String source, final String objectType, final String name, final String reason, final String password, final HttpHeaders headers) {
        final StringBuffer urlBuffer = new StringBuffer("{url}/{source}/{object-type}/{name}?reason={reason}");

        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", referencesApiUrl);
        variables.put("source", source);
        variables.put("object-type", objectType);
        variables.put("name", name);
        variables.put("reason", reason);
        if (password != null) {
            variables.put("password", password);
            urlBuffer.append("&password={password}");
        }

        URI uri = new UriTemplate(urlBuffer.toString()).expand(variables);

        LOGGER.debug("Performing delete {}", uri.toString());

        return restTemplate.exchange(uri,
            HttpMethod.DELETE,
            new HttpEntity<String>(headers),
            String.class);
    }
}


