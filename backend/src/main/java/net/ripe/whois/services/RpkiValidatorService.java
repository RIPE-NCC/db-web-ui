package net.ripe.whois.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;


@Service
public class RpkiValidatorService implements ExchangeErrorHandler {

    private final String apiUrl;
    private final RestTemplate restTemplate;

    @Autowired
    public RpkiValidatorService(
        final RestTemplate restTemplate,
        @Value("${rpki-validator.api.url}") final String apiUrl) {
        this.restTemplate = restTemplate;
        this.apiUrl = apiUrl;
    }

    public String getRoaValidity(final String origin, final String route) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        final Map<String, Object> params = Map.of("origin", origin, "route", route);
        final ResponseEntity<String> responseEntity = this.restTemplate.exchange(this.apiUrl + "{origin}/{route}",
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class,
            params
        );
        return responseEntity.getBody();
    }
}
