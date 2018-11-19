package net.ripe.whois.services;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.MediaType;
import java.net.URI;
import java.net.URISyntaxException;

@Service
public class WhoisInternalResourcesService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisInternalResourcesService.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final String contextPath;

    @Autowired
    public WhoisInternalResourcesService(
        final RestTemplate restTemplate,
        @Value("${internal.api.url}") final String apiUrl,
        @Value("${internal.api.key}") final String apiKey,
        @Value("${server.contextPath}") final String contextPath) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.contextPath = contextPath;
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final String body, final HttpHeaders headers) throws URISyntaxException {
        LOGGER.info("BYPASS: {}", withURI(request).toString() );

        return handleErrors(() -> restTemplate.exchange(
                withURI(request),
                HttpMethod.valueOf(request.getMethod()),
                withEntity(headers, body),
                String.class),
                LOGGER);
    }

    private URI withURI(final HttpServletRequest request) {
        return UriComponentsBuilder.fromHttpUrl(apiUrl)
            .path(request.getRequestURI().replace(contextPath, ""))
            .replaceQuery(request.getQueryString())
            .queryParam("apiKey", apiKey)
            .build().toUri();
    }

    private HttpEntity<?> withEntity(final HttpHeaders headers, final String body) {
        if (!headers.containsKey(HttpHeaders.ACCEPT)) {
            headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON);
        }
        return StringUtils.isNotBlank(body) ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);
    }
}
