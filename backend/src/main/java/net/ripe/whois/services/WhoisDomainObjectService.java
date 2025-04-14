package net.ripe.whois.services;

import com.google.common.collect.Maps;
import jakarta.ws.rs.core.MediaType;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriTemplate;

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
        LOGGER.debug("Set restApiUrl to {}", this.restApiUrl);
    }

    @Async
    public Future<ResponseEntity<String>> createDomainObjects(
                final String source,
                List<String> passwords,
                final List<WhoisObject> domainObjects,
                final String remoteAddress,
                final String cookie) {

        final WhoisResources whoisResources = new WhoisResources();
        whoisResources.setWhoisObjects(domainObjects);

        final HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_TYPE.toString());
        headers.add(HttpHeaders.ACCEPT_ENCODING, "identity");
        headers.add(HttpHeaders.COOKIE, cookie);
        headers.add(HttpHeaders.CONNECTION, "close");
        headers.add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_TYPE.toString());

        ResponseEntity<String> result;
        try {
            result = restTemplate.postForEntity(getCreateDomainUri(source, passwords, remoteAddress), new HttpEntity<>(whoisResources, headers), String.class);
        } catch (HttpClientErrorException.BadRequest e) {
            // whois update failed due to validation failure etc. (expected)
            LOGGER.info("Failed to create domain object(s): {}:{}\n{}\n{}", e.getClass().getName(), e.getMessage(), e.getResponseBodyAsString(), e.getStatusCode());
            result = new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        } catch (HttpClientErrorException e) {
            LOGGER.info("Failed to create domain object(s): {}:{}\n{}\n{}", e.getClass().getName(), e.getMessage(), e.getResponseBodyAsString(), e.getStatusCode());
            result = new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        } catch (HttpServerErrorException e) {
            final String msg = "Call to Whois backend failed: ";
            final String responseBody = e.getResponseBodyAsString();
            LOGGER.error("{}: {}: {}\n{}", msg, e.getClass().getName(), e.getMessage(), responseBody);
            if ((responseBody != null) && responseBody.contains("errormessages")) {
                result = new ResponseEntity<>(responseBody, HttpStatus.BAD_REQUEST);
            } else {
                result = new ResponseEntity<>(msg + e.getMessage(), e.getStatusCode());
            }
        }
        return new AsyncResult<>(result);
    }

    private URI getCreateDomainUri(final String source, final List<String> passwords, final String clientIp) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", restApiUrl);
        variables.put("source", source);
        variables.put("clientIp", clientIp);
        final URI uri = new UriTemplate("{url}/domain-objects/{source}?clientIp={clientIp}").expand(variables);
        final UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUri(uri);
        if (passwords != null) {
            for (String password : passwords){
                uriComponentsBuilder.queryParam("password", password);
            }
        }
        return uriComponentsBuilder.build().encode().toUri();
    }
}
