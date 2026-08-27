package net.ripe.whois.config;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Resolves the OAuth2 authorization request, adding {@code prompt=none} when the
 * incoming request has {@code ?silent=true} so Keycloak performs a silent SSO check
 */
public class SilentAwareAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(SilentAwareAuthorizationRequestResolver.class);

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public SilentAwareAuthorizationRequestResolver(ClientRegistrationRepository clientRegistrationRepository,
                                                   String authorizationRequestBaseUri) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, authorizationRequestBaseUri);
        this.defaultResolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        LOGGER.debug("resolve(request) uri={} contextPath={} servletPath={}", request.getRequestURI(), request.getContextPath(), request.getServletPath());
        return customize(defaultResolver.resolve(request), request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return customize(defaultResolver.resolve(request, clientRegistrationId), request);
    }

    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request) {
        if (authorizationRequest == null) {
            return null;
        }

        LOGGER.debug("customize() ENTRY additionalParameters={}", authorizationRequest.getAdditionalParameters());

        if (!"true".equals(request.getParameter("silent"))) {
            LOGGER.debug("not silent, returning authorizationRequest");
            return authorizationRequest;
        }

        Map<String, Object> extraParams = new HashMap<>(authorizationRequest.getAdditionalParameters());
        extraParams.put("prompt", "none");

        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .additionalParameters(extraParams)
                .attributes(authorizationRequest.getAttributes())
                .build();
    }

}
