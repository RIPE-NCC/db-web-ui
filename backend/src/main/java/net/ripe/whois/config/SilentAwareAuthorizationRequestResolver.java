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
        this.defaultResolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce()); // <-- the actual missing piece
        LOGGER.info("calling solent aware authorization!");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        LOGGER.info("resolve(request) uri={} contextPath={} servletPath={}",
                request.getRequestURI(), request.getContextPath(), request.getServletPath());
        OAuth2AuthorizationRequest resolved = defaultResolver.resolve(request);
        if (resolved != null) {
            LOGGER.info("BEFORE customize: silentParam={} attributes={}", request.getParameter("silent"), resolved.getAttributes());
        }
        return customize(resolved, request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest resolved = defaultResolver.resolve(request, clientRegistrationId);
        if (resolved != null) {
            LOGGER.info("BEFORE customize: silentParam={} attributes={}", request.getParameter("silent"), resolved.getAttributes());
        }
        return customize(resolved, request);
    }


    private OAuth2AuthorizationRequest customize(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request) {
        if (authorizationRequest == null) {
            return null;
        }

        LOGGER.info("customize() ENTRY additionalParameters={}", authorizationRequest.getAdditionalParameters());

        if (!"true".equals(request.getParameter("silent"))) {
            return authorizationRequest;
        }

        Map<String, Object> extraParams = new HashMap<>(authorizationRequest.getAdditionalParameters());
        extraParams.put("prompt", "none");

        LOGGER.info("customize() extraParams after adding prompt={}", extraParams);

        OAuth2AuthorizationRequest customized = OAuth2AuthorizationRequest.from(authorizationRequest)
                .additionalParameters(extraParams)
                .attributes(authorizationRequest.getAttributes())
                .build();

        LOGGER.info("customize() EXIT additionalParameters={} attributes={}", customized.getAdditionalParameters(), customized.getAttributes());

        return customized;
    }

}
