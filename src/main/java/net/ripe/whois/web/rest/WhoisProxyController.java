package net.ripe.whois.web.rest;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Enumeration;

@RestController
@RequestMapping("/whois")
public class WhoisProxyController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisProxyController.class);

    private final RestTemplate restTemplate;

    @Inject
    private Environment env;

    public WhoisProxyController() {
        restTemplate = createRestTemplate();
    }

    @RequestMapping(value = "/**")
    public ResponseEntity<String> proxyRestCalls(@RequestBody final String body, final HttpServletRequest request) throws Exception {

        final URI uri = composeWhoisUrl(request);

        final HttpHeaders headers = createHeaders(request);

        return restTemplate.exchange(
            uri,
            HttpMethod.valueOf(request.getMethod().toUpperCase()),
            new HttpEntity<>(body, headers),
            String.class);
    }

    private HttpHeaders createHeaders(final HttpServletRequest request ) {
        final HttpHeaders headers = new HttpHeaders();

        final Enumeration<String> headerNames = request.getHeaderNames();

        boolean found_X_Forwarded_For = false;
        while (headerNames.hasMoreElements()) {
            final String header = headerNames.nextElement();
            final Enumeration<String> values = request.getHeaders(header);

            while (values.hasMoreElements()) {
                final String value = values.nextElement();
                headers.add(header, value);
                if (header.equals(com.google.common.net.HttpHeaders.X_FORWARDED_FOR)
                    && StringUtils.isNotBlank(value)){
                    found_X_Forwarded_For = true;
                }
            }
        }

        if (!found_X_Forwarded_For){
            headers.set(com.google.common.net.HttpHeaders.X_FORWARDED_FOR, request.getRemoteAddr());
        }

        return headers;
    }

    private URI composeWhoisUrl(final HttpServletRequest request) throws URISyntaxException {

            final StringBuilder sb = new StringBuilder(env.getProperty("rest.api.ripeUrl"))
                .append(request.getRequestURI().replace("/whois", ""));

            if (StringUtils.isNotBlank(request.getQueryString())) {
                sb.append(request.getQueryString());
            }

        LOGGER.info("uri = " + sb.toString());
        return new URI(sb.toString());
    }

    private RestTemplate createRestTemplate() {
        final RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(new RestResponseErrorHandler());
        return restTemplate;
    }
}
