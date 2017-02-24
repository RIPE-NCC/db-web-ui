package net.ripe.whois.services;

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
public class BaAppsService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisRestService.class);

    private static final String MEMBER = "member";
    private static final String RIPE_DB_ORGS = "ripe-db-orgs";

    private final RestTemplate restTemplate;
    private final String baAppsUrl;

    @Autowired
    public BaAppsService(
        final RestTemplate restTemplate,
        @Value("${ba-apps.api.url}") final String baAppsUrl) {
        this.restTemplate = restTemplate;
        this.baAppsUrl = baAppsUrl;
    }


    /**
     * @return JSON with the LIRs for a given user determined through the token passed.
     */
    public String getLirs(final String crowdToken) {
        return getAccountData(crowdToken, MEMBER);
    }

    /**
     * @return JSON with the organisations for a given user determined through the token passed.
     */
    public String getOrganisations(final String crowdToken) {
        return getAccountData(crowdToken, RIPE_DB_ORGS);
    }

    private String getAccountData(final String crowdToken, final String type) {
        try {
            final ResponseEntity<String> response = restTemplate.exchange(
                "{baAppsUrl}/authorisation-service/v2/notification/account/{crowdToken}/{type}",
                HttpMethod.GET,
                new HttpEntity<String>(withHeaders(MediaType.APPLICATION_JSON_VALUE)),
                String.class,
                withParams(crowdToken, type));

            final String body = response.getBody();
            if (response.getStatusCode() != HttpStatus.OK) {
                LOGGER.warn("Failed to retrieve LIRs for Crowd token {} due to {}",
                    crowdToken,
                    (body != null ? body : "(no response body)"));

                throw new RestClientException(response.getStatusCode().value(), "Unable to get LIRs");
            }
            return body;
        } catch (org.springframework.web.client.RestClientException e) {
            LOGGER.warn("Failed to retrieve LIRs for Crowd token {} due to {}", crowdToken, e.getMessage());
            throw new RestClientException(e);
        }
    }

    private HashMap<String, Object> withParams(final String crowdToken, String type) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("baAppsUrl", baAppsUrl);
        variables.put("crowdToken", crowdToken);
        variables.put("type", type);
        return variables;
    }

    private MultiValueMap<String, String> withHeaders(final String accept) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", accept);
        return headers;
    }

}
