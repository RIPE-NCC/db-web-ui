package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

/**
 * Call various BA Apps APIs.
 *
 * Caching
 * The Authorisation Service API calls are handled by the SSO Application, and are all cached on the server side.
 * The Member Resources API call is cached by the ResourceTicketService (see below).
 *
 */
@Service
public class BaAppsService implements ExchangeErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisRestService.class);
    private final RestTemplate restTemplate;
    private final String baAppsUrl;
    private final String apiKey;

    @Autowired
    public BaAppsService(
            final RestTemplate restTemplate,
            @Value("${ba-apps.api.url}") final String baAppsUrl,
            @Value("${ba-apps.api.key}") final String apiKey) {
        this.restTemplate = restTemplate;
        this.baAppsUrl = baAppsUrl;
        this.apiKey = apiKey;
    }

    /**
     * Get ALL resource tickets for a member.
     *
     * Caching
     * This API call is cached through the ResourceTicketService (do not call this method directly).
     *
     * @param memberId
     * @return
     */
    public String getResourceTickets(long memberId) {

        String url = baAppsUrl + "/resource-services/member-resources/{memberId}?api-key={apiKey}";
        try {
            LOGGER.info("Calling {} with memberId {}", url, memberId);
            final ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<String>(withHeaders(MediaType.APPLICATION_JSON_VALUE)),
                    String.class,
                    memberId, apiKey);
            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RestClientException(response.getStatusCode().value(), "Unable to get resource tickets");
            }
            return response.getBody();
        } catch (RestClientException e) {
            LOGGER.warn("Failed to retrieve LIRs due to {}", e.getMessage());
            throw new RestClientException(e);
        }
    }

    private MultiValueMap<String, String> withHeaders(final String accept) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", accept);
        return headers;
    }

}
