package net.ripe.whois.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriTemplate;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

import static com.google.common.collect.Maps.newHashMap;

@Service
public class WhoisSyncupdatesService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisSyncupdatesService.class);

    private static final String X_FORWARDED_FOR = "X-Forwarded-For";

    private final RestTemplate restTemplate;
    private final String syncupdatesApiUrl;

    @Autowired
    public WhoisSyncupdatesService(final RestTemplate restTemplate,
                                   @Value("${syncupdates.api.url}") final String apiUrl) {
        this.restTemplate = restTemplate;
        this.syncupdatesApiUrl = apiUrl;
    }

    public ResponseEntity<String> proxy(final String rpslObject, final HttpHeaders headers) {
        final HttpHeaders proxyHeaders = new HttpHeaders();

        final List<String> cookie = headers.get(HttpHeaders.COOKIE);
        if (cookie != null) {
            proxyHeaders.put(HttpHeaders.COOKIE, cookie);
        }

        final List<String> forwardedFor = headers.get(X_FORWARDED_FOR);
        if (forwardedFor != null) {
            proxyHeaders.put(X_FORWARDED_FOR, forwardedFor);
        }

        proxyHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        proxyHeaders.setAcceptCharset(Collections.singletonList(StandardCharsets.UTF_8));
        proxyHeaders.setAccept(Collections.singletonList(MediaType.TEXT_PLAIN));
        proxyHeaders.set(HttpHeaders.ACCEPT_ENCODING, "identity");

        final URI uri = new UriTemplate(syncupdatesApiUrl).expand(newHashMap());

        LOGGER.debug("Performing syncupdates {}", uri.toString());

        return handleErrors(() -> restTemplate.exchange(uri,
                HttpMethod.POST,
                new HttpEntity<>("DATA=" + rpslObject, proxyHeaders),
                String.class), LOGGER);
    }
}
