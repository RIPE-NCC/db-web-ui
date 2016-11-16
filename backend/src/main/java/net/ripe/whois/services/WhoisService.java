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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

@Service
public class WhoisService {

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

        try {
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
        } catch (HttpClientErrorException e) {
            return new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode());
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
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

}
