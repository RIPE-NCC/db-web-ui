package net.ripe.whois.services;

import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriTemplate;

import javax.ws.rs.core.MediaType;
import java.net.URI;
import java.util.HashMap;
import java.util.List;

@Service
public class WhoisDomainObjectService {

    private final String domainObjectApiUrl;
    private final RestTemplate restTemplate;

    @Autowired
    public WhoisDomainObjectService(final RestTemplate restTemplate, @Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.domainObjectApiUrl = ripeUrl;
        this.restTemplate = restTemplate;
        LOGGER.debug("Set domainObjectApiUrl to " + this.domainObjectApiUrl);
    }

    public ResponseEntity createDomainObjects(final String source, String[] passwords, final List<WhoisObject> domainObjects, final HttpHeaders headers) {

        final WhoisResources whoisResources = new WhoisResources();
        whoisResources.setWhoisObjects(domainObjects);

        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", domainObjectApiUrl);
        variables.put("source", source);

        final URI uri = new UriTemplate("{url}/domain-objects/{source}").expand(variables);

        final UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUri(uri);
        if (passwords != null && passwords.length > 0) {
            uriComponentsBuilder.queryParam("password", passwords);
        }

        headers.remove(HttpHeaders.ACCEPT_ENCODING);
        headers.set(HttpHeaders.ACCEPT_ENCODING, "identity");
        headers.remove(HttpHeaders.ACCEPT);
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_TYPE.toString());

        try {
            return restTemplate.exchange(uriComponentsBuilder.build().encode().toUri(), HttpMethod.POST, new HttpEntity(whoisResources, headers), String.class);
        } catch (HttpClientErrorException e) {
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        }
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectService.class);

}
