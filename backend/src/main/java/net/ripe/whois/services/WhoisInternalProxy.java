package net.ripe.whois.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Component
public class WhoisInternalProxy implements ExchangeErrorHandler, WhoisServiceBase {

    private final String contextPath;

    @Autowired
    public WhoisInternalProxy(
            @Value("${server.contextPath}") final String contextPath) {
        this.contextPath = contextPath;
    }

    URI composeProxyUrl(final String requestURI,
                        final String apiUrl,
                        final String apiKey) {
        return composeProxyUrl(requestURI, "", "", apiUrl, apiKey, false);
    }

    URI composeProxyUrl(final String requestURI,
                        final String requestQueryString,
                        final String pathToReplace,
                        final String apiUrl,
                        final String apiKey) {
        return composeProxyUrl(requestURI, requestQueryString, pathToReplace, apiUrl, apiKey, false);
    }

    URI composeProxyUrl(final String requestURI,
                        final String requestQueryString,
                        final String pathToReplace,
                        final String apiUrl,
                        final String apiKey,
                        final Boolean encoded) {
        try {
            return UriComponentsBuilder.fromHttpUrl(apiUrl)
                .path(replacePathAndNormalise(requestURI, pathToReplace))
                .replaceQuery(requestQueryString)
                .queryParam("apiKey", apiKey)
                .build(encoded).toUri();
        } catch (Exception e) {
            throw new IllegalStateException("Invalid URI " + requestURI, e);
        }
    }

    private String replacePathAndNormalise(final String requestURI, final String pathToReplace){
       return requestURI
           .replaceFirst(pathToReplace, "")
           .replace(contextPath, "");
    }
}
