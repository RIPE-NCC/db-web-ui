package net.ripe.whois.oidc;

import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.jwt.JwtDecoderFactory;

import java.time.Instant;

@TestConfiguration
public class OidcTestConfig {

    @Bean
    @Primary // overrides the main application's manager bean
    public OAuth2AuthorizedClientManager authorizedClientManager() {
        OAuth2AuthorizedClientManager manager = Mockito.mock(OAuth2AuthorizedClientManager.class);

        ClientRegistration clientRegistration = ClientRegistration.withRegistrationId("my-client-id")
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .clientId("test-client")
                .tokenUri("http://localhost:8080/oauth/token") // dummy URI
                .build();

        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "mock-integration-test-token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600)
        );

        OAuth2AuthorizedClient authorizedClient = new OAuth2AuthorizedClient(
                clientRegistration,
                "principal-user",
                accessToken
        );

        Mockito.when(manager.authorize(Mockito.any())).thenReturn(authorizedClient);

        return manager;
    }

    // OIDC

    @Bean
    public KeycloakIdPDummyService keycloakIdPDummyService() {
        return new KeycloakIdPDummyService();
    }

    @Bean
    @Primary
    public OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> testTokenResponseClient(final KeycloakIdPDummyService keycloakIdPDummyService) {
        return keycloakIdPDummyService.tokenResponseClient();
    }

    @Bean
    @Primary
    public OAuth2UserService<OidcUserRequest, OidcUser> testOidcUserService(final KeycloakIdPDummyService keycloakIdPDummyService) {
        return keycloakIdPDummyService.oidcUserService();
    }

    @Bean
    @Primary
    public JwtDecoderFactory<ClientRegistration> testJwtDecoderFactory() {
        return registration -> new UnverifiedTestJwtDecoder();
    }

}
