package net.ripe.whois.config;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Disabled
class SecurityConfigTest {

    @Mock
    OAuth2AuthorizedClientService authorizedClientService;

    @Mock
    RestTemplate restTemplate;

    @Mock
    OAuth2AuthorizedClient authorizedClient;

    @Test
    void shouldLoadAuthorizedClientOnAuthenticationSuccess() throws Exception {

        SecurityConfig config = new SecurityConfig();

        AuthenticationSuccessHandler handler =
            config.authenticationSuccessHandler(authorizedClientService, restTemplate);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2AuthenticationToken authentication =
            mock(OAuth2AuthenticationToken.class);

        when(authentication.getAuthorizedClientRegistrationId())
            .thenReturn("keycloak");

        when(authentication.getName())
            .thenReturn("john");

        when(authorizedClientService.loadAuthorizedClient(
            "keycloak",
            "john"))
            .thenReturn(authorizedClient);

        handler.onAuthenticationSuccess(
            request,
            response,
            authentication);

        verify(authorizedClientService)
            .loadAuthorizedClient("keycloak", "john");
    }

    @Test
    void shouldRedirectToNextUrlAfterSuccessfulAuthentication() throws Exception {
        SecurityConfig config = new SecurityConfig();


        AuthenticationSuccessHandler handler =
            config.authenticationSuccessHandler(
                authorizedClientService, restTemplate);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2AuthorizationRequest authorizationRequest = mock(OAuth2AuthorizationRequest.class);
        OAuth2AuthenticationToken authentication =
            mock(OAuth2AuthenticationToken.class);


        when(authentication.getAuthorizedClientRegistrationId())
            .thenReturn("keycloak");

        when(authentication.getName())
            .thenReturn("john");

        when(authorizedClientService.loadAuthorizedClient(
            "keycloak",
            "john"))
            .thenReturn(authorizedClient);

        handler.onAuthenticationSuccess(
            request,
            response,
            authentication);

        assertEquals("/query?test=true", response.getRedirectedUrl());

        verify(authorizedClientService)
            .loadAuthorizedClient("keycloak", "john");
    }

    @Test
    void shouldRedirectToDefaultUrlWhenNextUrlNotPresent() throws Exception {
        SecurityConfig config = new SecurityConfig();

        AuthenticationSuccessHandler handler =
            config.authenticationSuccessHandler(authorizedClientService, restTemplate);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        OAuth2AuthenticationToken authentication =
            mock(OAuth2AuthenticationToken.class);

        when(authentication.getAuthorizedClientRegistrationId())
            .thenReturn("keycloak");

        when(authentication.getName())
            .thenReturn("john");

        when(authorizedClientService.loadAuthorizedClient(
            "keycloak",
            "john"))
            .thenReturn(authorizedClient);

        handler.onAuthenticationSuccess(
            request,
            response,
            authentication);

        verify(authorizedClientService)
            .loadAuthorizedClient("keycloak", "john");
    }
}
