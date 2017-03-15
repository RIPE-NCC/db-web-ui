package net.ripe.whois.services;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.db.whois.common.rpsl.AttributeType;
import org.apache.commons.lang.StringUtils;
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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WhoisInternalService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisInternalService.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final String contextPath;

    // TODO: [ES] replace internal.api properties with separate key per API path
    @Autowired
    public WhoisInternalService(
            final RestTemplate restTemplate,
            @Value("${internal.api.url}") final String apiUrl,
            @Value("${internal.api.key}") final String apiKey,
            @Value("${server.contextPath}") final String contextPath) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.contextPath = contextPath;
    }

    public List<Map<String,Object>> getMaintainers(final UUID uuid) {

        // fetch as xml
        final ResponseEntity<WhoisResources> response;
        try {
            response = restTemplate.exchange("{apiUrl}/api/user/{uuid}/maintainers?apiKey={apiKey}",
                HttpMethod.GET,
                new HttpEntity<String>(withHeaders(MediaType.APPLICATION_XML_VALUE)),
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
        final List<Map<String, Object>> summaries = Lists.newArrayList();
        if (response.getStatusCode() == HttpStatus.OK && response.hasBody()) {
            for (WhoisObject obj : response.getBody().getWhoisObjects()) {
                Map<String, Object> objectSummary = Maps.newHashMap();
                objectSummary.put("key", getObjectKey(obj));
                objectSummary.put("type", getObjectType(obj));
                objectSummary.put(AttributeType.AUTH.getName(), getValuesForAttribute(obj, AttributeType.AUTH));
                objectSummary.put("mine", true);
                summaries.add(objectSummary);
            }
        }

        return summaries;
    }

    private HashMap<String, Object> withParams(final UUID uuid) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("apiKey", apiKey);
        variables.put("uuid", uuid);
        return variables;
    }

    private MultiValueMap<String, String> withHeaders(final String accept) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", accept);
        return headers;
    }

    private String getObjectKey(final WhoisObject obj) {
        return obj.getPrimaryKey().stream().findFirst().map(Attribute::getValue).orElse(null);
    }

    private String getObjectType(final WhoisObject obj) {
        return obj.getPrimaryKey().stream().findFirst().map(Attribute::getName).orElse(null);
    }

    private List<String> getValuesForAttribute(final WhoisObject obj, final AttributeType type) {
        return obj.getAttributes().stream().
            filter(a -> a.getName().equals(type.getName())).
            map(Attribute::getValue).collect(Collectors.toList());
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final String body, final HttpHeaders headers) throws URISyntaxException {
        final URI uri = composeWhoisUrl(request);

        return handleErrors(() -> {
            if (body == null) {
                return restTemplate.exchange(
                    uri,
                    HttpMethod.valueOf(request.getMethod().toUpperCase()),
                    new HttpEntity<>(headers),
                    String.class);
            } else {
                return restTemplate.exchange(
                    uri,
                    HttpMethod.valueOf(request.getMethod().toUpperCase()),
                    new HttpEntity<>(body, headers),
                    String.class);
            }
        }, LOGGER);
    }

    private URI composeWhoisUrl(final HttpServletRequest request) throws URISyntaxException {
        return UriComponentsBuilder.fromHttpUrl(apiUrl)
            .path(request.getRequestURI()
                .replace("/api/whois-internal", "")
                .replace(contextPath, ""))
            .replaceQuery(request.getQueryString())
            .queryParam("apiKey", apiKey)
            .build().toUri();
    }

}
