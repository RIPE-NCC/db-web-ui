package net.ripe.whois.services;

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
import org.springframework.web.util.UriTemplate;

import java.net.URI;

import static com.google.common.collect.Maps.newHashMap;

@Service
public class WhoisSyncupdatesService implements ExchangeErrorHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisSyncupdatesService.class);

    private final RestTemplate restTemplate;
    private final String syncupdatesApiUrl;

    @Autowired
    public WhoisSyncupdatesService(final RestTemplate restTemplate,
                                   @Value("${syncupdates.api.url}") final String apiUrl) {
        this.restTemplate = restTemplate;
        this.syncupdatesApiUrl = apiUrl;
    }

    public ResponseEntity<String> proxy(final String rpslObject, final HttpHeaders headers) {
        final URI uri = new UriTemplate(syncupdatesApiUrl).expand(newHashMap());

        LOGGER.debug("Performing syncupdates {}", uri.toString());

        return handleErrors(() -> restTemplate.exchange(uri,
                HttpMethod.POST,
                new HttpEntity<>("DATA=" + rpslObject, headers),
                String.class), LOGGER);
    }
}
