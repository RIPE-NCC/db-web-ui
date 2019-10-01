package net.ripe.whois.services;

import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.db.whois.common.rpsl.AttributeType;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static net.ripe.whois.CrowdTokenFilter.CROWD_TOKEN_KEY;

@Service
public class WhoisInternalService implements ExchangeErrorHandler, WhoisServiceBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisInternalService.class);

    private final RestTemplate restTemplate;
    private final WhoisInternalProxy whoisInternalProxy;
    private final String apiKey;
    private final String apiUrl;

    // TODO: [ES] replace internal.api properties with separate key per API path
    @Autowired
    public WhoisInternalService(
            final RestTemplate restTemplate,
            final WhoisInternalProxy whoisInternalProxy,
            @Value("${internal.api.url}") final String apiUrl,
            @Value("${internal.api.key}") final String apiKey) {
        this.restTemplate = restTemplate;
        this.whoisInternalProxy = whoisInternalProxy;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    public List<Map<String,Object>> getMaintainers(final String uuid) {

        // fetch as xml
        final ResponseEntity<WhoisResources> response;
        try {
            response = restTemplate.exchange(this.apiUrl+"/api/user/{uuid}/maintainers",
                HttpMethod.GET,
                getRequestEntity(Optional.of(apiKey)),
                WhoisResources.class,
                withParams(uuid));

            if (response.getStatusCode() != HttpStatus.OK) {
                // Do not return internal-only error message to the user, just log it.

                LOGGER.warn("Failed to retrieve mntners for UUID {} due to {}",
                        uuid,
                        (response.getBody() != null ? response.getBody().getErrorMessages() : "(no response body)"));

                throw new RestClientException(response.getStatusCode().value(), "Unable to get maintainers");
            }
        } catch (org.springframework.web.client.RestClientException e) {
            LOGGER.warn("Failed to retrieve mntners for UUID {} due to {}", uuid, e.getMessage());
            throw new RestClientException(e);
        }

        // use big whois-resources-resp to compose small compact response that looks like autocomplete-service
        if (response.getStatusCode() != HttpStatus.OK || !response.hasBody()) {
            return Collections.emptyList();
        }

        return response.getBody().getWhoisObjects().stream().map(obj -> {
            Map<String, Object> objectSummary = Maps.newHashMap();
            objectSummary.put("key", getObjectSinglePrimaryKey(obj));
            objectSummary.put("type", getObjectType(obj));
            objectSummary.put(AttributeType.AUTH.getName(), getValuesForAttribute(obj, AttributeType.AUTH));
            objectSummary.put("mine", true);
            return objectSummary;
        }).collect(Collectors.toList());

    }

    private HashMap<String, Object> withParams(final String uuid) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("uuid", uuid);
        return variables;
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final String body, final HttpHeaders headers) {
        headers.set(API_KEY_HEADER, apiKey);
        final URI uri = composeWhoisUrl(request);
        LOGGER.info("Calling WhoisInternalService {}", uri);
        return handleErrors(() ->
            restTemplate.exchange(
                uri,
                HttpMethod.valueOf(request.getMethod().toUpperCase()),
                new HttpEntity<>(body, headers),
                String.class), LOGGER);
    }

    public UserInfoResponse getUserInfo(String crowdToken) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add("Cookie",CROWD_TOKEN_KEY + "=" + crowdToken);
        httpHeaders.set(API_KEY_HEADER, apiKey);
        final URI uri = whoisInternalProxy.composeProxyUrl("api/user/info", apiUrl);
        LOGGER.info("Calling Whois InternalService to retrieve user info {}", uri);
        try {
            return restTemplate.exchange(uri, HttpMethod.GET,
                new HttpEntity<>("", httpHeaders), UserInfoResponse.class).getBody();
        } catch (HttpClientErrorException e) {
            LOGGER.warn("Failed to retrieve user info from whois internal {}", e.getMessage());
            throw new RestClientException(e.getStatusCode().value(), "");
        } catch (Exception e){
            LOGGER.warn("Exception: Failed to parse user info from whois internal {}", e.getMessage());
            throw new RestClientException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal server error");
        }
    }

    public boolean getActiveToken(String crowdToken) {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add("Cookie",CROWD_TOKEN_KEY + "=" + crowdToken);
        httpHeaders.add(API_KEY_HEADER, apiKey);
        final URI uri = whoisInternalProxy.composeProxyUrl("api/user/active", apiUrl);
        LOGGER.info("Calling Whois InternalService to retrieve user active {}", uri);
        try {
            return restTemplate.exchange(uri, HttpMethod.GET,
                new HttpEntity<>("", httpHeaders), Boolean.class).getBody();
        } catch (Exception e){
            LOGGER.warn("Exception: Failed to parse user active from whois internal {}", e.getMessage());
            return false;
        }
    }

    public ResponseEntity<byte[]> bypassFile(final HttpServletRequest request, final String body, final HttpHeaders headers) {
        headers.set(API_KEY_HEADER, apiKey);
        final URI uri = composeWhoisUrl(request);
        LOGGER.info("Calling WhoisInternalService {}", uri);
        return restTemplate.exchange(
            uri,
            HttpMethod.valueOf(request.getMethod().toUpperCase()),
            new HttpEntity<>(body, headers),
            byte[].class);
    }

    private URI composeWhoisUrl(final HttpServletRequest request) {
        return whoisInternalProxy.composeProxyUrl(request.getRequestURI(),
            request.getQueryString(),
            "/api/whois-internal",
            apiUrl,
            true);
    }

}
