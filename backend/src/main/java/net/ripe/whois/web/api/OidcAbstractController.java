package net.ripe.whois.web.api;

import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import javax.annotation.Nullable;

public abstract class OidcAbstractController extends ApiController {

    private static final Logger LOGGER = LoggerFactory.getLogger(OidcAbstractController.class);

    private final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;

    public OidcAbstractController(final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager) {
        this.oAuth2AuthorizedClientManager = oAuth2AuthorizedClientManager;
    }

    @Nullable
    protected String extractBearerToken(final HttpServletRequest request,
                                        final Authentication authentication) {
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
        } catch (Exception e) {
            LOGGER.info("Error while extracting bearer token: ", e);
        }
        return null;
    }

    protected void setAuthorizationHeader(final HttpServletRequest request,
                                          final Authentication authentication,
                                          final HttpHeaders headers) {
        final String bearerToken = extractBearerToken(request, authentication);
        if (StringUtils.isNotBlank(bearerToken)) {
            headers.setBearerAuth(bearerToken);
        }
    }
}
