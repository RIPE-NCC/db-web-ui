package net.ripe.whois.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Component
public class WhoisProxyUrl implements ExchangeErrorHandler, WhoisServiceBase {

    private final String contextPath;

    @Autowired
    public WhoisProxyUrl(
            @Value("${server.contextPath}") final String contextPath) {
        this.contextPath = contextPath;
    }

    URI composeProxyUrl(final String requestURI,
                        final String requestQueryString,
                        final String pathToReplace,
                        final String apiUrl) {
        return composeProxyUrl(requestURI, requestQueryString, pathToReplace, apiUrl, "");
    }

    URI composeProxyUrl(final String requestURI,
                        final String requestQueryString,
                        final String pathToReplace,
                        final String apiUrl,
                        final String apiKey) {
        try {
            UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .path(replacePathAndNormalise(requestURI, pathToReplace))
                .replaceQuery(requestQueryString);

            if (!apiKey.isEmpty()){
                uriComponentsBuilder.queryParam("apiKey", apiKey);
            }

            return uriComponentsBuilder.build(true).toUri();
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
