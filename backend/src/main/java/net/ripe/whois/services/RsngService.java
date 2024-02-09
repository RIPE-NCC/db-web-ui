package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.web.api.baapps.MemberResources;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

/**
 * Call various RSNG API.
 *
 * Caching
 * The Member Resources API call is cached by the ResourceTicketService (see below).
 *
 */
@Service
public class RsngService implements ExchangeErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisRestService.class);
    private final RestTemplate restTemplate;
    private final String rsngBaseUrl;
    private final String apiKey;

    @Autowired
    public RsngService(
            final RestTemplate restTemplate,
            @Value("${rsng.api.url}") final String rsngBaseUrl,
            @Value("${rsng.api.key}") final String apiKey) {
        this.restTemplate = restTemplate;
        this.rsngBaseUrl = rsngBaseUrl;
        this.apiKey = apiKey;
    }

    public MemberResources getMemberResources(final long memberId) {
        try {
            LOGGER.debug("Calling RSNG with memberId {}", memberId);
            final ResponseEntity<MemberResources> response = restTemplate.exchange(
                    rsngBaseUrl + "/resource-services/member-resources/{memberId}",
                    HttpMethod.GET,
                    new HttpEntity<String>(withHeaders()),
                    MemberResources.class,
                    memberId);
            if (response.getStatusCode() != HttpStatus.OK) {
                LOGGER.warn("Unable to retrieve member resources for {} due to unexpected status {}", memberId, response.getStatusCode());
                throw new RestClientException(response.getStatusCode().value(), "Unable to get member resources");
            }
            return response.getBody();
        } catch (RestClientException e) {
            LOGGER.warn("Failed to retrieve LIRs due to {}: {}", e.getClass().getName(), e.getMessage());
            throw new RestClientException(e);
        } catch (ResourceAccessException e) {
            LOGGER.warn("Failed to retrieve LIRs due to {}: {}", e.getClass().getName(), e.getMessage());
            throw new ResourceAccessException("Unable to get member resources");
        }
    }

    private MultiValueMap<String, String> withHeaders() {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set("ncc-internal-api-key", apiKey);
        return headers;
    }

}
