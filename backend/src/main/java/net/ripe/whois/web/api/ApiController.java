package net.ripe.whois.web.api;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.ClientAuthorizationRequiredException;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import javax.annotation.Nullable;

public class ApiController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiController.class);

    protected void removeUnnecessaryHeaders(final HttpHeaders headers) {
        // The address used for this header was the one used on the browser.
        // This problem was caused by the need to bypass all the request to the proxy,
        // but it was not able to resolve it and the response was HTTP-400.
        headers.remove(HttpHeaders.HOST);
    }

    @Nullable
    protected String extractBearerToken(final HttpServletRequest request,
                                      final Authentication authentication,
                                      final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager) {
        try {
            if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                final OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                        .withClientRegistrationId(oauthToken.getAuthorizedClientRegistrationId())
                        .principal(authentication)
                        .attribute(HttpServletRequest.class.getName(), request)
                        .build();

                final OAuth2AuthorizedClient authorizedClient = oAuth2AuthorizedClientManager.authorize(authorizeRequest);
                if (authorizedClient != null) {
                    return authorizedClient.getAccessToken().getTokenValue();
                }
            }
        } catch (ClientAuthorizationRequiredException e) {
            LOGGER.info("Error while extracting bearer token");
        }
        return null;
    }
}
