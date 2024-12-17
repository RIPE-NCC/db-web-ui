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
import org.springframework.web.util.UriComponentsBuilder;

import javax.annotation.Nullable;
import java.net.URI;

@Service
public class WhoisReferencesService implements ExchangeErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisReferencesService.class);

    private static final int MAX_RESULT_NUMBER = 5;

    private final RestTemplate restTemplate;
    private final String referencesApiUrl;

    @Autowired
    public WhoisReferencesService(final RestTemplate restTemplate, @Value("${rest.api.ripeUrl}") final String restApiUrl) {
        this.restTemplate = restTemplate;
        this.referencesApiUrl = buildReferencesApiUri(restApiUrl).toString();
    }

    private URI buildReferencesApiUri(final String restApiUrl) {
        try {
            return UriComponentsBuilder.fromUriString(restApiUrl)
                .pathSegment("references")
                .build()
                .toUri();
        } catch (IllegalArgumentException e) {
            LOGGER.warn("Invalid References URI {}/references", restApiUrl);
            throw e;
        }
    }

    public ResponseEntity<String> getReferences(final String source, final String objectType, final String objectName, final Integer limit, final HttpHeaders headers) {
        return handleErrors(() -> restTemplate.exchange(buildReadUri(source, objectType, objectName, limit),
                HttpMethod.GET,
                new HttpEntity<String>(headers),
                String.class), LOGGER);
    }

    private URI buildReadUri(final String source, final String objectType, final String objectName, final Integer limit) {
        try {
            final URI uri = UriComponentsBuilder.fromUriString(referencesApiUrl)
                .pathSegment(source)
                .pathSegment(objectType)
                .pathSegment(objectName)
                .queryParam("limit", limit != null ? limit : MAX_RESULT_NUMBER)
                .build()
                .toUri();
            LOGGER.debug("Read URI {}", uri);
            return uri;
        } catch (IllegalArgumentException e) {
            LOGGER.warn("Invalid Read URI {}/{}/{}/{}?limit={}", referencesApiUrl, source, objectType, objectName, limit);
            throw e;
        }
    }

    public ResponseEntity<String> createReferencedObjects(final String source, final String body, final HttpHeaders headers) {
        return handleErrors(() -> restTemplate.exchange(buildCreateUri(source),
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                String.class), LOGGER);
    }

    private URI buildCreateUri(final String source) {
        try {
            final URI uri = UriComponentsBuilder.fromUriString(referencesApiUrl)
                .pathSegment(source)
                .build()
                .toUri();
            LOGGER.debug("Create URI {}", uri);
            return uri;
        } catch (IllegalArgumentException e) {
            LOGGER.warn("Invalid Create URI {}/{}", referencesApiUrl, source);
            throw e;
        }
    }

    public ResponseEntity<String> deleteObjectAndReferences(final String source, final String objectType, final String name, final String reason, @Nullable final String password, final HttpHeaders headers) {
        return handleErrors(() -> restTemplate.exchange(buildDeleteUri(source, objectType, name, reason, password),
                HttpMethod.DELETE,
                new HttpEntity<String>(headers),
                String.class), LOGGER);
    }

    private URI buildDeleteUri(final String source, final String objectType, final String objectName, final String reason, final String password) {
        try {
            final UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(referencesApiUrl)
                .pathSegment(source)
                .pathSegment(objectType)
                .pathSegment(objectName)
                .queryParam("reason", reason);
            if (password != null) {
                builder.queryParam("password", password);
            }
            final URI uri = builder.build().toUri();
            LOGGER.debug("Delete URI {}", uri);
            return uri;
        } catch (IllegalArgumentException e) {
            LOGGER.warn("Invalid Delete URI {}/{}/{}/{}?reason={}&password={}", referencesApiUrl, source, objectType, objectName, reason, password);
            throw e;
        }
    }
}


