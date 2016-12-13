package net.ripe.whois.services;

import org.apache.commons.lang.StringUtils;
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
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

@Service
public class WhoisRestService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisRestService.class);

    private final RestTemplate restTemplate;
    private final String apiUrl;
    private final String contextPath;

    @Autowired
    public WhoisRestService(
            final RestTemplate restTemplate,
            @Value("${rest.api.ripeUrl}") final String apiUrl,
            @Value("${server.contextPath}") final String contextPath) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
        this.contextPath = contextPath;
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final String body, final HttpHeaders headers) throws URISyntaxException {
        final URI uri = composeWhoisUrl(request);

        // Do not accept compressed response, as it's not handled properly (by whois)
        headers.remove(HttpHeaders.ACCEPT_ENCODING);
        headers.set(HttpHeaders.ACCEPT_ENCODING, "identity");

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
            },
            (HttpStatusCodeException e) -> {
                if (e instanceof HttpClientErrorException) {
                    LOGGER.warn("Whois HTTP status {} will be returned as 200", e.getStatusCode());
                    return new ResponseEntity<>(e.getResponseBodyAsString(), HttpStatus.OK);
                }
                // e instanceof HttpServerErrorException
                return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
            }, LOGGER);
    }

    private URI composeWhoisUrl(final HttpServletRequest request) throws URISyntaxException {
        final StringBuilder builder = new StringBuilder(apiUrl)
                .append(request.getRequestURI().replace("/api/rest", "").replace(contextPath, ""));
        if (StringUtils.isNotBlank(request.getQueryString())) {
            builder.append('?')
                    .append(request.getQueryString());
        }
        LOGGER.debug("uri = {}", builder.toString());
        return new URI(builder.toString());
    }

}
