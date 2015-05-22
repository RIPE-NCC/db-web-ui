package net.ripe.whois.web.rest;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.WebUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;

@RestController
@RequestMapping("/whois")
public class WhoisProxyController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisProxyController.class);


    private final RestTemplate restTemplate;
    private static final String CROWD_TOKEN_KEY = "crowd.token_key";

    public WhoisProxyController() {
        restTemplate = createRestTemplate();
    }

    @RequestMapping(value = "/**")
    public ResponseEntity<String> proxyRestCalls(@RequestBody final String body, final HttpServletRequest request) throws Exception {

        final URI uri = composeWhoisUrl(request);

        final HttpHeaders headers = createHeaders( request);

        return restTemplate.exchange(
            uri,
            HttpMethod.valueOf(request.getMethod().toUpperCase()),
            new HttpEntity<>(body, headers),
            String.class);
    }

    private HttpHeaders createHeaders(final HttpServletRequest request ) {
        final HttpHeaders headers = new HttpHeaders();

        // We decided not to pass all headers: only a selective group
        headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("User-agent", request.getHeader("User-agent"));
        Cookie cookie = WebUtils.getCookie(request, CROWD_TOKEN_KEY);
        if (cookie != null) {
            headers.add("Cookie", String.format("%s=%s", CROWD_TOKEN_KEY,
                cookie.getValue()));
        }
        return headers;
    }

    private URI composeWhoisUrl(final HttpServletRequest request) throws URISyntaxException {
            final StringBuilder sb = new StringBuilder("http://db-dev-1.dev.ripe.net:1081/whois")
                .append(request.getRequestURI().replace("/whois",""));

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
