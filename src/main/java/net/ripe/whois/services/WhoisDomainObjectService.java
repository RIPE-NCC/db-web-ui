package net.ripe.whois.services;

import com.google.common.collect.Maps;
import net.ripe.whois.services.rest.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriTemplate;

import java.net.URI;
import java.util.HashMap;

@Service
public class WhoisDomainObjectService extends RestClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectService.class);

    private String domainObjectApiUrl;

    @Autowired
    public WhoisDomainObjectService(@Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.domainObjectApiUrl = ripeUrl + "/domain-objects";
    }

    public ResponseEntity<String> createDomainObjects(final String source, final String body, final HttpHeaders headers) {
        final String url = "{url}/{source}";

        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", domainObjectApiUrl);
        variables.put("source", source);

        URI uri = new UriTemplate(url).expand(variables);

        LOGGER.debug("Performing create {}", uri.toString() );

        return restTemplate.exchange(uri,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                String.class);
    }

}
