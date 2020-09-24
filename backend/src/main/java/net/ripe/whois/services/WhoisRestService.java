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
import org.springframework.web.util.UriUtils;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Enumeration;

@Service
public class WhoisRestService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisRestService.class);

    private final RestTemplate restTemplate;
    private final WhoisProxy whoisProxy;
    private final String apiUrl;

    @Autowired
    public WhoisRestService(
            final RestTemplate restTemplate,
            final WhoisProxy whoisProxy,
            @Value("${rest.api.ripeUrl}") final String apiUrl) {

        this.restTemplate = restTemplate;
        this.whoisProxy = whoisProxy;
        this.apiUrl = apiUrl;
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final String body, final HttpHeaders headers) throws URISyntaxException {
        final URI uri = whoisProxy.composeProxyUrl(request.getRequestURI(),
            request.getQueryString(),"/api/rest", apiUrl);

        // Do not accept compressed response, as it's not handled properly (by whois)
        headers.remove(HttpHeaders.ACCEPT_ENCODING);
        headers.set(HttpHeaders.ACCEPT_ENCODING, "identity");

        return handleErrors(() ->
                restTemplate.exchange(
                    uri,
                    HttpMethod.valueOf(request.getMethod().toUpperCase()),
                    new HttpEntity<>(body, headers),
                    String.class),

            (HttpStatusCodeException e) -> {
                logError(e, request, body);
                if (e instanceof HttpClientErrorException) {
                    LOGGER.warn("Whois HTTP status {} will be returned as 200", e.getStatusCode());
                    return new ResponseEntity<>(UriUtils.encode(e.getResponseBodyAsString(), "UTF-8"), HttpStatus.OK);
                }
                // e instanceof HttpServerErrorException
                return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
            }, LOGGER);
    }

    private void logError(final HttpStatusCodeException e, final HttpServletRequest request, final String body) {
        LOGGER.info("Whois HTTP request failed: {} ({})\n{}\nRequest:\n{}\n{}",
            e.getStatusCode(),
            e.getStatusText(),
            e.getResponseBodyAsString(),
            HttpRequestMessage.toString(request),
            body);
    }

    private static class HttpRequestMessage {

        public static String toString(final HttpServletRequest request) {
            return String.format("%s %s\n%s", request.getMethod(), formatUri(request), formatHttpHeaders(request));
        }

        private static String formatHttpHeaders(final HttpServletRequest request) {
            final StringBuilder builder = new StringBuilder();

            final Enumeration<String> names = request.getHeaderNames();
            while (names.hasMoreElements()) {
                final String name = names.nextElement();
                final Enumeration<String> values = request.getHeaders(name);
                while (values.hasMoreElements()) {
                    builder.append("Header: ").append(name).append('=').append(values.nextElement()).append('\n');
                }
            }

            return builder.toString();
        }

        private static String formatUri(final HttpServletRequest request) {
            if (StringUtils.isEmpty(request.getQueryString())) {
                return request.getRequestURI();
            } else {
                return String.format("%s?%s", request.getRequestURI(), request.getQueryString());
            }
        }
    }


}
