package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;

import net.ripe.db.whois.common.ip.Ipv4Resource;
import net.ripe.db.whois.common.ip.Ipv6Resource;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Service
public class WhoisService implements ExchangeErrorHandler, WhoisServiceBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisService.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String contextPath;

    @Autowired
    public WhoisService(final RestTemplate restTemplate, @Value("${rest.api.ripeUrl}") final String apiUrl, @Value("${server.contextPath}") final String contextPath) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.contextPath = contextPath;
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final String body, final HttpHeaders headers) throws URISyntaxException {
        final URI uri = composeWhoisUrl(request);

        // Do not accept compressed response, as it's not handled properly (by whois)
        headers.remove(HttpHeaders.ACCEPT_ENCODING);
        headers.set(HttpHeaders.ACCEPT_ENCODING, "identity");
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_UTF8_VALUE);
        return handleErrors(() ->
            restTemplate.exchange(
                uri,
                HttpMethod.valueOf(request.getMethod().toUpperCase()),
                new HttpEntity<>(body, headers),
                String.class), LOGGER);
    }

    private URI composeWhoisUrl(final HttpServletRequest request) throws URISyntaxException {
        final StringBuilder builder = new StringBuilder(apiUrl)
            .append(request.getRequestURI()
                .replace("/api/whois", "")
                .replace(contextPath, ""));

        if (StringUtils.isNotBlank(request.getQueryString())) {
            builder
                .append('?')
                .append(request.getQueryString());
        }

        LOGGER.debug("uri = {}", builder.toString());

        return new URI(builder.toString());
    }

    // TODO: [ES] refactor this logic, move into WhoisHierarchyController. Expose generic Search API here instead.

    public List<String> getPathToRoot(String type, String key, String org) throws URISyntaxException {
        final URI uri = lessSpecificUrl(type, key);

        final ResponseEntity<WhoisResources> response;
        try {
            response = restTemplate.exchange(uri,
                    HttpMethod.GET,
                    getRequestEntity(),
                    WhoisResources.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                LOGGER.warn("Failed to retrieve less specific resources for resource {} due to {}",
                    key,
                    (response.getBody() != null ? response.getBody().getErrorMessages() : "(no response body)"));

                throw new RestClientException(response.getStatusCode().value(), "Unable to get less specific resources");
            }
        } catch (Exception e) {
            LOGGER.warn("Failed to retrieve less specific resources for resource {} due to {}", key, e.getMessage());
            throw new RestClientException(e);
        }

        if (response.getStatusCode() != HttpStatus.OK || !response.hasBody()) {
            return Collections.emptyList();
        }

        boolean metOrg = false;
        final List<String> resources = new ArrayList<>();
        for (final WhoisObject o : response.getBody().getWhoisObjects()) {
            final boolean hasOrg = o.getAttributes().stream().anyMatch(a -> "org".equals(a.getName()) && org.equals(a.getValue()));
            if (hasOrg || metOrg) {
                metOrg = true;
                final String objectKey = getObjectSinglePrimaryKey(o);
                if (!theSameResource(objectKey, key, type)) {
                    resources.add(objectKey);
                }
            }
        }
        return resources;
    }

    private URI lessSpecificUrl(final String objectType, final String objectName) throws URISyntaxException {
        return UriComponentsBuilder.fromHttpUrl(apiUrl)
            .path("/search.xml")
            .queryParam("query-string", objectName)
            .queryParam("type-filter", objectType)
            .queryParam("flags", "rL")
            .build(false).toUri();
    }

    private boolean theSameResource(String r1, String r2, String type) {
        switch (type) {
            case "inetnum" :
                return Ipv4Resource.parse(r1).equals(Ipv4Resource.parse(r2));
            case "inet6num" :
                return Ipv6Resource.parse(r1).equals(Ipv6Resource.parse(r2));
            default:
                return r1.equals(r2);
        }
    }
}
