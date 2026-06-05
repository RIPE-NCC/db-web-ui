package net.ripe.whois.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            DefaultOAuth2AuthorizationRequestResolver pkceResolver,
                                            AuthenticationSuccessHandler successHandler,
                                            OidcClientInitiatedLogoutSuccessHandler logoutSuccessHandler) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> {
                    oauth.authorizationEndpoint(auth -> auth.authorizationRequestResolver(pkceResolver));
                    oauth.successHandler(successHandler);
                })
            .logout(logout -> logout
                .logoutSuccessHandler(logoutSuccessHandler)
            );;

        return http.build();
    }

    @Bean
    public DefaultOAuth2AuthorizationRequestResolver pkceResolver(ClientRegistrationRepository repo) {

        DefaultOAuth2AuthorizationRequestResolver resolver = new DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
        // for code_challenge_method
        resolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());

        return resolver;
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler(OAuth2AuthorizedClientService authorizedClientService, RestTemplate restTemplate) {

        SavedRequestAwareAuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();

        return (request, response, authentication) -> {

            OAuth2AuthenticationToken oauthToken =
                (OAuth2AuthenticationToken) authentication;

            OAuth2AuthorizedClient client =
                authorizedClientService.loadAuthorizedClient(
                    oauthToken.getAuthorizedClientRegistrationId(),
                    oauthToken.getName());

            String accessToken = client.getAccessToken().getTokenValue();

            // Call your API
//            restTemplate.postForObject(
//                "https://my-api.example.com/store-token",
//                Map.of("token", accessToken),
//                Void.class);
            System.out.println("Access token: " + accessToken);
            System.out.println("RefreshToken: " + client.getRefreshToken().getTokenValue());

          // TODO redirect to proper url

            delegate.onAuthenticationSuccess(
                request,
                response,
                authentication);
        };
    }

    // Logout
    @Bean
    OidcClientInitiatedLogoutSuccessHandler oidcLogoutSuccessHandler(
        ClientRegistrationRepository clientRegistrationRepository) {

        OidcClientInitiatedLogoutSuccessHandler handler =
            new OidcClientInitiatedLogoutSuccessHandler(
                clientRegistrationRepository);

        handler.setPostLogoutRedirectUri("{baseUrl}");

        return handler;
    }

}
