package net.ripe.whois.services;

import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.whois.services.rest.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.util.UriTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.List;

@Service
public class WhoisDomainObjectService extends RestClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectService.class);

    private String domainObjectApiUrl;

    @Autowired
    public WhoisDomainObjectService(@Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.domainObjectApiUrl = ripeUrl + "/whois/domain-objects";
    }

    public ResponseEntity<WhoisResources> createDomainObjects(final String source, final List<WhoisObject> domainObjects, final HttpHeaders headers) {
        final String url = "{url}/{source}";

        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", domainObjectApiUrl);
        variables.put("source", source);

        URI uri = new UriTemplate(url).expand(variables);

        WhoisResources whoisResources = new WhoisResources();
        whoisResources.setWhoisObjects(domainObjects);

        LOGGER.debug("Performing create {}", uri.toString());

        WhoisResources result = null;
        try {
            result = restTemplate.postForObject(uri + "?password=test", new HttpEntity<>(whoisResources, headers), WhoisResources.class);
            return new ResponseEntity<>(result, HttpStatus.CREATED);
        } catch (HttpClientErrorException e) {
            return new ResponseEntity<>(result, e.getStatusCode());
        }
    }

}
