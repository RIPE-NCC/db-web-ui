package net.ripe.whois.services;

// proxy for e.g. http://int-dev.db.ripe.net/api/resources/ipv4/ORG-IOB1-RIPE.json?apiKey=DB-WHOIS-fe91223ec3a27c24

import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;

@Service
public class WhoisInternalResourcesService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisInternalResourcesService.class);

    static final String IPV4_RESOURCES_PATH = "api/resources/ipv4";

    private static final String FAILED_TO_RETRIEVE_RESOURCES_FOR_ORG = "Failed to retrieve ipv4 resources for orgId {} due to {}";

    private final RestTemplate restTemplate;

    private final String apiUrl;

    private final String apiKey;

    @Autowired
    public WhoisInternalResourcesService(
        final RestTemplate restTemplate,
        @Value("${internal.resources.api.url}") final String apiUrl,
        @Value("${internal.resources.api.key}") final String apiKey,
        @Value("${server.contextPath}") final String contextPath) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    public ResponseEntity<String> getIpv4Resources(String orgId) {
        // fetch as xml
        final ResponseEntity<String> response;
        try {
            response = restTemplate.exchange("{apiUrl}/{path}/{orgId}.json?apiKey={apiKey}",
                HttpMethod.GET,
                new HttpEntity<String>(withHeaders(MediaType.APPLICATION_JSON_VALUE)),
                String.class,
                withParams(orgId));

            if (response.getStatusCode() != HttpStatus.OK) {
                // Do not return internal-only error message to the user, just log it.

                LOGGER.warn(FAILED_TO_RETRIEVE_RESOURCES_FOR_ORG, orgId,
                    (response.getBody() != null ? response.getBody() : "(no response body)"));

                throw new RestClientException(response.getStatusCode().value(), "Unable to get ipv4 resources");
            }
        } catch (org.springframework.web.client.RestClientException e) {
            LOGGER.warn(FAILED_TO_RETRIEVE_RESOURCES_FOR_ORG, orgId, e.getMessage());
            throw new RestClientException(e);
        }
        return new ResponseEntity<>(response.getBody(), HttpStatus.OK);
    }

    private HashMap<String, Object> withParams(final String orgId) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("apiKey", apiKey);
        variables.put("path", IPV4_RESOURCES_PATH);
        variables.put("orgId", orgId);
        return variables;
    }

    private MultiValueMap<String, String> withHeaders(final String accept) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", accept);
        return headers;
    }
}
