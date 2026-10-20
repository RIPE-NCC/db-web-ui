package net.ripe.whois.web.api;

import jakarta.servlet.http.HttpSession;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.annotation.Nullable;

@Component
public class OidcTokenExtractor {

    private static final Logger LOGGER = LoggerFactory.getLogger(OidcTokenExtractor.class);

    private final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;

    public OidcTokenExtractor(final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager) {
        this.oAuth2AuthorizedClientManager = oAuth2AuthorizedClientManager;
    }

    @Nullable
    public String extract() {
        try {
            final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                final OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                        .withClientRegistrationId(oauthToken.getAuthorizedClientRegistrationId())
                        .principal(authentication)
                        .build();

                final OAuth2AuthorizedClient authorizedClient = oAuth2AuthorizedClientManager.authorize(authorizeRequest);
                if (authorizedClient != null) {
                    return authorizedClient.getAccessToken().getTokenValue();
                }
            }
        } catch (Exception e) {
            LOGGER.debug("Error while extracting bearer token: ", e);
        }
        return null;
    }

    @Nullable
    public String extractWithLogs() {
        try {
            final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                final OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                        .withClientRegistrationId(oauthToken.getAuthorizedClientRegistrationId())
                        .principal(authentication)
                        .build();

                final OAuth2AuthorizedClient authorizedClient = oAuth2AuthorizedClientManager.authorize(authorizeRequest);
                if (authorizedClient != null) {
                    return authorizedClient.getAccessToken().getTokenValue();
                } else {
                    LOGGER.info("No authorized client for principal={} registration={} session={}",
                            authentication.getName(),
                            oauthToken.getAuthorizedClientRegistrationId(),
                            sessionInfo());
                }
            } else {
                LOGGER.info("No OAuth2 authentication found: auth={} session={}",
                        authentication == null ? "null" : authentication.getClass().getSimpleName(),
                        sessionInfo());
            }
        } catch (Exception e) {
            LOGGER.info("Error while extracting bearer token: session={}", sessionInfo(), e);
        }
        return null;
    }

    private String sessionInfo() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs)) {
            return "no-request-bound";
        }
        final HttpSession session = attrs.getRequest().getSession(false);
        return session == null ? "none"
                : session.getId() + " ageMs=" + (System.currentTimeMillis() - session.getCreationTime());
    }


    public void setAuthorizationHeader(final HttpHeaders headers) {
        final String bearerToken = extract();
        if (StringUtils.isNotBlank(bearerToken)) {
            headers.setBearerAuth(bearerToken);
            headers.remove(HttpHeaders.COOKIE);
        }
    }
}
