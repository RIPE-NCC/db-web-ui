package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.RestClient;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

@RestController
@RequestMapping("/api/whois")
public class WhoisProxyController extends RestClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisProxyController.class);

    @Autowired
    private Environment env;

    @RequestMapping(value = "/**")
    public ResponseEntity<String> proxyRestCalls(@RequestBody final String body, @RequestHeader HttpHeaders headers, final HttpServletRequest request) throws Exception {

        final URI uri = composeWhoisUrl(request);

        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");

        return restTemplate.exchange(
            uri,
            HttpMethod.valueOf(request.getMethod().toUpperCase()),
            new HttpEntity<>(body, headers),
            String.class);
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
