package net.ripe.whois.services;

import com.google.common.collect.Lists;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.db.whois.common.ip.Ipv4Resource;
import net.ripe.db.whois.common.ip.Ipv6Resource;
import org.apache.commons.io.IOUtils;
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
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.annotation.Nullable;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.StringJoiner;


@Service
public class WhoisService implements ExchangeErrorHandler, WhoisServiceBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisService.class);

    private final RestTemplate restTemplate;
    private final WhoisProxy whoisProxy;
    private final String apiUrl;

    @Autowired
    public WhoisService(
            final RestTemplate restTemplate,
            final WhoisProxy whoisProxy,
            @Value("${rest.api.ripeUrl}") final String apiUrl) {
        this.restTemplate = restTemplate;
        this.whoisProxy = whoisProxy;
        this.apiUrl = apiUrl;
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final HttpServletResponse response, @Nullable final String requestBody, final HttpHeaders requestHeaders) {
        // Do not accept compressed response, as it's not handled properly (by whois)
        requestHeaders.remove(HttpHeaders.ACCEPT_ENCODING);
        requestHeaders.set(HttpHeaders.ACCEPT_ENCODING, "identity");
        requestHeaders.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        return handleErrors(() -> stream(request, response, requestBody, requestHeaders), LOGGER);
    }

    private ResponseEntity<String> stream(final HttpServletRequest request, final HttpServletResponse response, final String requestBody, final HttpHeaders requestHeaders) {
        response.setStatus(HttpStatus.OK.value());
        return restTemplate.execute(
            composeWhoisUrl(request),
            HttpMethod.valueOf(request.getMethod().toUpperCase()),
             httpEntityCallback(new HttpEntity<>(requestBody, requestHeaders)),
            responseExtractor -> {
                IOUtils.copy(responseExtractor.getBody(), response.getOutputStream());
                return null;
            });
    }

    // TODO: [ES] refactor this logic, move into WhoisHierarchyController. Expose generic Search API here instead.

    public List<String> getPathToRoot(String type, String key, String org) throws URISyntaxException {
        final URI uri = lessSpecificUrl(type, key);

        final ResponseEntity<WhoisResources> response;
        final WhoisResources whoisResources;
        try {
            response = restTemplate.exchange(uri,
                    HttpMethod.GET,
                    getRequestEntity(Optional.empty()),
                    WhoisResources.class);

            whoisResources = response.getBody();
            if (response.getStatusCode() != HttpStatus.OK) {
                LOGGER.warn("Failed to retrieve less specific resources for resource {} due to {}",
                    key,
                    (whoisResources != null ? whoisResources.getErrorMessages() : "(no response body)"));

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
        final List<String> resources = Lists.newArrayList();

        if (whoisResources != null) {
            for (final WhoisObject o : whoisResources.getWhoisObjects()) {
                final boolean hasOrg = o.getAttributes().stream().anyMatch(a -> "org".equals(a.getName()) && org.equals(a.getValue()));
                if (hasOrg || metOrg) {
                    metOrg = true;
                    final String objectKey = getObjectSinglePrimaryKey(o);
                    if (!theSameResource(objectKey, key, type)) {
                        resources.add(objectKey);
                    }
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
        return switch (type) {
            case "inetnum" -> Ipv4Resource.parse(r1).equals(Ipv4Resource.parse(r2));
            case "inet6num" -> Ipv6Resource.parse(r1).equals(Ipv6Resource.parse(r2));
            default -> r1.equals(r2);
        };
    }

    private <T> RequestCallback httpEntityCallback(final HttpEntity<T> requestEntity) {
        return new RestTemplate() {
            {
                this.setMessageConverters(restTemplate.getMessageConverters());
                setRequestFactory(restTemplate.getRequestFactory());
            }

            <T> RequestCallback httpEntityCallback() {
                return httpEntityCallback(requestEntity);
        	}
        }.httpEntityCallback();
    }

    private URI composeWhoisUrl(final HttpServletRequest request) {
        final String clientIpParam = String.format("clientIp=%s", request.getRemoteAddr());
        final String queryString = request.getQueryString() == null ? clientIpParam : new StringJoiner("&").add(request.getQueryString()).add(clientIpParam).toString();

        return whoisProxy.composeProxyUrl(request.getRequestURI(),
           joinRoaCheck(queryString),
           "/api/whois",
           apiUrl);
    }

    private String joinRoaCheck(final String queryString){
        return new StringJoiner("&").add(queryString).add("roa-check=false").toString();
    }
}
