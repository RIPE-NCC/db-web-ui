package net.ripe.whois.services;

import net.ripe.whois.services.rest.RestClient;
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

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

@Service
public class WhoisService extends RestClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisService.class);

    private final String apiUrl;
    private final String contextPath;

    @Autowired
    public WhoisService(@Value("${rest.api.ripeUrl}") final String apiUrl, @Value("${server.contextPath}") final String contextPath) {
        this.apiUrl = apiUrl;
        this.contextPath = contextPath;
    }

    public ResponseEntity<String> getObjectMntners(final HttpServletRequest request, , final HttpHeaders headers,
                                                   final String objectType, final String objectName) throws URISyntaxException {
        final URI uri = composeWhoisUrl(request);

        return restTemplate.exchange(
                uri,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);
    }

    public ResponseEntity<String> bypass(final HttpServletRequest request, final String body, final HttpHeaders headers) throws URISyntaxException {
        final URI uri = composeWhoisUrl(request);

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
    }

    private URI composeWhoisUrl(HttpServletRequest request) throws URISyntaxException {
        final StringBuilder sb = new StringBuilder(apiUrl)
            .append(request.getRequestURI()
                .replace("/api/whois", "")
                .replace(contextPath, ""));

        if (StringUtils.isNotBlank(request.getQueryString())) {
            sb.append("?" + request.getQueryString());
        }

        LOGGER.debug("uri = " + sb.toString());
        return new URI(sb.toString());
    }

}
