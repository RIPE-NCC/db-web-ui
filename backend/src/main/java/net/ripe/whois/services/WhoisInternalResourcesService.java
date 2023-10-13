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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.core.MediaType;
import java.net.URI;
import java.net.URISyntaxException;

@Service
public class WhoisInternalResourcesService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisInternalResourcesService.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String apiKey;
    private final WhoisInternalProxy whoisInternalProxy;

    @Autowired
    public WhoisInternalResourcesService(
        final RestTemplate restTemplate,
        final WhoisInternalProxy whoisInternalProxy,
        @Value("${internal.api.url}") final String apiUrl,
        @Value("${internal.api.key}") final String apiKey) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.whoisInternalProxy = whoisInternalProxy;
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
        return whoisInternalProxy.composeProxyUrl(
            request.getRequestURI(),
            request.getQueryString(),
            "",
            apiUrl);
    }

    private HttpEntity<?> withEntity(final HttpHeaders headers, final String body) {
        if (!headers.containsKey(HttpHeaders.ACCEPT)) {
            headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON);
        }
        headers.set("X-API_KEY", apiKey);
        return StringUtils.isNotBlank(body) ? new HttpEntity<>(body, headers) : new HttpEntity<>(headers);
    }
}
