package net.ripe.whois.config;

import com.hazelcast.core.HazelcastInstance;
import net.ripe.whois.config.hazelcast.HazelcastAuthorizationRequestRepository;
import net.ripe.whois.config.hazelcast.HazelcastOAuth2AuthorizedClientService;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import net.ripe.whois.config.hazelcast.HazelcastSecurityContextRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthenticatedPrincipalOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.savedrequest.NullRequestCache;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    private static final String POST_LOGIN_REDIRECT_URL = "/db-web-ui/query";

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            DefaultOAuth2AuthorizationRequestResolver pkceResolver,
                                            AuthenticationSuccessHandler successHandler,
                                            OidcClientInitiatedLogoutSuccessHandler logoutSuccessHandler,
                                            SecurityContextRepository securityContextRepository,
                                            AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository,
                                            LogoutHandler hazelcastLogoutHandler) throws Exception {

        PathPatternRequestMatcher.Builder requestMatcherBuilder = PathPatternRequestMatcher.withDefaults();

        http
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .securityContext(sc -> sc.securityContextRepository(securityContextRepository))
                .requestCache(cache -> cache.requestCache(new NullRequestCache())) // no saved-request redirect needed — fixed URL instead
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/",
                                "/index.html",
                                "/assets/**",
                                "/media/**",
                                "/*.js",
                                "/*.svg",
                                "/*.css",
                                "/api/**",
                                "/app.constants.json",
                                "/webupdates/select",
                                "/webupdates/display",
                                "/webupdates/modify/**",
                                "/forceDelete",
                                "/query",
                                "/fulltextsearch",
                                "/syncupdates",
                                "/lookup",
                                "/fmp",
                                "/fmp/requireLogin",
                                "/unsubscribe.*",
                                "/unsubscribe-confirm.*",
                                "/myresources/overview",
                                "/myresources/detail/**",
                                "/ip-analyser",
                                "/legal",
                                "/error",
                                "/not-found").permitAll()
                        .requestMatchers("/public/**", "/api/healthcheck", "/api/syncupdates", "/api/whois-internal/api/user/info", "/api/metadata/help", "/api/whois/search", "/api/whois/ripe/**").permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .oauth2Login(oauth -> {
                    oauth.authorizationEndpoint(auth -> auth
                            .authorizationRequestResolver(pkceResolver)
                            .authorizationRequestRepository(authorizationRequestRepository));
                    oauth.successHandler(successHandler);
                })
                .oidcLogout(logout -> logout.backChannel(Customizer.withDefaults()))
                .logout(logout -> logout
                        .addLogoutHandler(hazelcastLogoutHandler)
                        .deleteCookies("DBSESSIONID", "oauth2_auth_request")
                        .logoutRequestMatcher(new OrRequestMatcher(
                                requestMatcherBuilder.matcher(HttpMethod.GET, "/logout"),
                                requestMatcherBuilder.matcher(HttpMethod.POST, "/logout")))
                        .logoutSuccessHandler(logoutSuccessHandler));

        return http.build();
    }

    @Bean
    public DefaultOAuth2AuthorizationRequestResolver pkceResolver(ClientRegistrationRepository repo) {
        DefaultOAuth2AuthorizationRequestResolver resolver = new DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
        resolver.setAuthorizationRequestCustomizer(OAuth2AuthorizationRequestCustomizers.withPkce());
        return resolver;
    }

    @Bean
    public SecurityContextRepository securityContextRepository(HazelcastInstance hazelcastInstance) {
        return new HazelcastSecurityContextRepository(hazelcastInstance, "keycloak");
    }

    @Bean
    public OidcSessionRegistry oidcSessionRegistry(HazelcastInstance hazelcastInstance) {
        return new HazelcastOidcSessionRegistry(hazelcastInstance);
    }

    @Bean
    public AuthorizationRequestRepository<OAuth2AuthorizationRequest> authorizationRequestRepository(HazelcastInstance hazelcastInstance) {
        return new HazelcastAuthorizationRequestRepository(hazelcastInstance);
    }

    @Bean
    public HazelcastAuthorizationRequestRepository hazelcastAuthorizationRequestRepository(HazelcastInstance hazelcastInstance) {
        return new HazelcastAuthorizationRequestRepository(hazelcastInstance);
    }
    @Bean
    public LogoutHandler hazelcastLogoutHandler(SecurityContextRepository securityContextRepository) {
        return (request, response, authentication) ->
                ((HazelcastSecurityContextRepository) securityContextRepository).evict(request, response);
    }

    /*@Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler(OAuth2AuthorizedClientService authorizedClientService) {
        return (request, response, authentication) -> {

            OAuth2AuthenticationToken oauthToken =
                    (OAuth2AuthenticationToken) authentication;

            authorizedClientService.loadAuthorizedClient(
                    oauthToken.getAuthorizedClientRegistrationId(),
                    oauthToken.getName());

            response.sendRedirect(POST_LOGIN_REDIRECT_URL);
        };
    }


    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler(
            OAuth2AuthorizedClientService authorizedClientService,
            HazelcastAuthorizationRequestRepository hazelcastAuthorizationRequestRepository) {

        DefaultRedirectStrategy defaultRedirectStrategy = new DefaultRedirectStrategy();
        SavedRequestAwareAuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();

        delegate.setRedirectStrategy((request, response, url) -> {
            // Fetch the entry from Hazelcast using the incoming 'state' parameter from Keycloak
            Optional<HazelcastAuthorizationRequestRepository.Entry> entry = hazelcastAuthorizationRequestRepository.loadAuthorizationEntry(request);

            String next = entry.map(HazelcastAuthorizationRequestRepository.Entry::nextUrl).orElse(null);

            if (next != null) {
                // Clean up the authorization state from Hazelcast manually since login succeeded
                hazelcastAuthorizationRequestRepository.removeAuthorizationRequest(request, response);
                response.sendRedirect(next);
            } else {
                defaultRedirectStrategy.sendRedirect(request, response, url);
            }
        });

        return delegate;
    }*/

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler(
            OAuth2AuthorizedClientService authorizedClientService,
            HazelcastAuthorizationRequestRepository hazelcastAuthorizationRequestRepository) {

        DefaultRedirectStrategy defaultRedirectStrategy = new DefaultRedirectStrategy();

        return (request, response, authentication) -> {
            Optional<HazelcastAuthorizationRequestRepository.Entry> entry =
                    hazelcastAuthorizationRequestRepository.loadAuthorizationEntry(request);

            // Why this is needed?
            OAuth2AuthenticationToken oauthToken =
                    (OAuth2AuthenticationToken) authentication;

            authorizedClientService.loadAuthorizedClient(
                    oauthToken.getAuthorizedClientRegistrationId(),
                    oauthToken.getName());

            String next = entry.map(HazelcastAuthorizationRequestRepository.Entry::nextUrl).orElse(null);

            if (next != null) {
                hazelcastAuthorizationRequestRepository.removeAuthorizationRequest(request, response);
                defaultRedirectStrategy.sendRedirect(request, response, next);
            } else {
                defaultRedirectStrategy.sendRedirect(request, response, POST_LOGIN_REDIRECT_URL);
            }
        };
    }

    @Bean
    public RestClient oauth2RestClient(OAuth2AuthorizedClientManager authorizedClientManager,
                                       RestClient.Builder restClientBuilder) {
        final OAuth2ClientHttpRequestInterceptor requestInterceptor =
                new OAuth2ClientHttpRequestInterceptor(authorizedClientManager);
        requestInterceptor.setClientRegistrationIdResolver(request -> "keycloak");

        return restClientBuilder
                .requestInterceptor(requestInterceptor)
                .build();
    }

    // Logout from the provider when a user logout from the application
    @Bean
    OidcClientInitiatedLogoutSuccessHandler oidcLogoutSuccessHandler(
            ClientRegistrationRepository clientRegistrationRepository) {

        OidcClientInitiatedLogoutSuccessHandler handler =
                new OidcClientInitiatedLogoutSuccessHandler(
                        clientRegistrationRepository);

        handler.setPostLogoutRedirectUri("{baseUrl}/query");

        return handler;
    }

    @Bean
    public OAuth2AuthorizedClientService authorizedClientService(HazelcastInstance hazelcastInstance) {
        return new HazelcastOAuth2AuthorizedClientService(hazelcastInstance);
    }

    @Bean
    public OAuth2AuthorizedClientRepository authorizedClientRepository(OAuth2AuthorizedClientService authorizedClientService) {
        return new AuthenticatedPrincipalOAuth2AuthorizedClientRepository(authorizedClientService);
    }

}
