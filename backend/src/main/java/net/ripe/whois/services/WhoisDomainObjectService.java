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
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriTemplate;

import javax.ws.rs.core.MediaType;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.Future;

@Service
public class WhoisDomainObjectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectService.class);

    private final String restApiUrl;
    private final RestTemplate restTemplate;

    @Autowired
    public WhoisDomainObjectService(final RestTemplate restTemplate, @Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.restApiUrl = ripeUrl;
        this.restTemplate = restTemplate;
        LOGGER.debug("Set restApiUrl to " + this.restApiUrl);
    }

    @Async
    public Future<ResponseEntity<String>> createDomainObjects(final String source, String[] passwords, final List<WhoisObject> domainObjects, final HttpHeaders headers) {

        final WhoisResources whoisResources = new WhoisResources();
        whoisResources.setWhoisObjects(domainObjects);

        headers.remove(HttpHeaders.ACCEPT_ENCODING);
        headers.set(HttpHeaders.ACCEPT_ENCODING, "identity");
        headers.remove(HttpHeaders.ACCEPT);
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_TYPE.toString());

        ResponseEntity<String> result;
        try {
            result = restTemplate.postForEntity(getCreateDomainUri(source, passwords), new HttpEntity<>(whoisResources, headers), String.class);
        } catch (HttpClientErrorException e) {
            LOGGER.error("Fail to create domain object(s): " + e.getMessage());
            LOGGER.error(e.getResponseBodyAsString());
            LOGGER.error(e.getStatusCode() + ":", e);
            result = new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        } catch (HttpServerErrorException e) {
            String msg = "Call to Whois backend failed: ";
            LOGGER.error(msg + e.getMessage(), e);
            result = new ResponseEntity<>(msg + e.getMessage(), e.getStatusCode());
        }
        return new AsyncResult<>(result);
    }

    private URI getCreateDomainUri(final String source, final String[] passwords) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", restApiUrl);
        variables.put("source", source);

        final URI uri = new UriTemplate("{url}/domain-objects/{source}").expand(variables);

        final UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUri(uri);
        if (passwords != null && passwords.length > 0) {
            uriComponentsBuilder.queryParam("password", passwords);
        }
        return uriComponentsBuilder.build().encode().toUri();
    }

    public Boolean sameOrMoreSpecificExists(final String prefix) {
        try {
            restTemplate.getForEntity(getSameExistsUri(prefix), String.class);
            restTemplate.getForEntity(getMoreSpecificExistsUri(prefix), String.class);
            return true;
        } catch (HttpClientErrorException e) {
            LOGGER.error("Fail to create domain object(s): " +e.getMessage());
            LOGGER.error(e.getResponseBodyAsString());
            LOGGER.error(e.getStatusCode() +":", e);
            return false;
        }

    }


    private URI getSameExistsUri(final String prefix) {
        return buildDomainExistsUri("{url}/search.json?query-string={prefix}&type-filter=domain&flags=all-more&flags=reverse-domain&flags=no-filtering&flags=no-referenced", prefix);
    }

    //TODO - get correct query
    private URI getMoreSpecificExistsUri(final String prefix) {
        return buildDomainExistsUri("{url}/search.json?query-string={prefix}&type-filter=domain&flags=all-more&flags=reverse-domain&flags=no-filtering&flags=no-referenced", prefix);
    }

    private URI buildDomainExistsUri(String uri, String prefix) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", restApiUrl);
        variables.put("prefix", prefix);

        return new UriTemplate(uri).expand(variables);
    }


}
