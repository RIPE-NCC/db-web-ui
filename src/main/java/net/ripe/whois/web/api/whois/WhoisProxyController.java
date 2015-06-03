package net.ripe.whois.web.api.whois;

import net.ripe.whois.external.clients.RestClient;
import org.apache.commons.lang.StringUtils;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Enumeration;

@RestController
@RequestMapping("/api/whois")
public class WhoisProxyController extends RestClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisProxyController.class);

    @Autowired
    private Environment env;

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

        while (headerNames.hasMoreElements()) {
            final String header = headerNames.nextElement();

            final Enumeration<String> values = request.getHeaders(header);
            while (values.hasMoreElements()) {
                final String value = values.nextElement();
                headers.add(header, value);
            }
        }
        //Connection value "keep-alive" has problems with resttemplate
        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");
        return headers;
    }

    private URI composeWhoisUrl(final HttpServletRequest request) throws URISyntaxException {
        final StringBuilder sb = new StringBuilder(env.getProperty("rest.api.ripeUrl"))
            .append(request.getRequestURI().replace("/api/whois", "").replace(env.getProperty("server.contextPath"), ""));

            if (StringUtils.isNotBlank(request.getQueryString())) {
                sb.append(request.getQueryString());
            }

        LOGGER.info("uri = " + sb.toString());
        return new URI(sb.toString());
    }
}
