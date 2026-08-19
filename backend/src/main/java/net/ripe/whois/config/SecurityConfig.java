package net.ripe.whois.config;

import com.hazelcast.core.HazelcastInstance;
import net.ripe.whois.config.hazelcast.HazelcastOAuth2AuthorizedClientService;
import net.ripe.whois.config.hazelcast.HazelcastSessionConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthenticatedPrincipalOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestCustomizers;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import static net.ripe.whois.config.NextUrlFilter.NEXT_URL_SESSION_ATTRIBUTE;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastSessionConfig.class);

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            DefaultOAuth2AuthorizationRequestResolver pkceResolver,
                                            AuthenticationSuccessHandler successHandler,
                                            OidcClientInitiatedLogoutSuccessHandler logoutSuccessHandler,
                                            OAuth2AuthorizedClientRepository authorizedClientRepository) throws Exception {

        PathPatternRequestMatcher.Builder requestMatcherBuilder = PathPatternRequestMatcher.withDefaults();


        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/",
                        "/index.html",
                        "/assets/**",
                        "/media/**", // fontawesome
                        "/*.js",
                        "/*.svg",
                        "/*.css",
                        "/api/**", /* let rest-operation itself decide about authentication */
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
                .requestMatchers("/public/**", "/api/healthcheck", "/api/syncupdates", "/api/whois-internal/api/user/info","/api/metadata/help", "/api/whois/search", "/api/whois/ripe/**").permitAll()
                .anyRequest().authenticated()
            )
            // 1. Tell Spring to only create a session if it absolutely needs to (e.g., after login)
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )
            // 2. Ensure CSRF does not force session creation for guests
            .csrf(csrf -> csrf
                    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            )
            .oauth2Client(oauth2 -> oauth2
                    .authorizedClientRepository(authorizedClientRepository)
            )
            .oauth2Login(oauth -> {
                    oauth.authorizedClientRepository(authorizedClientRepository);
                    oauth.authorizationEndpoint(auth -> auth.authorizationRequestResolver(pkceResolver));
                    oauth.successHandler(successHandler);
                })
            .logout(logout -> logout
                .deleteCookies()
                .logoutRequestMatcher(new OrRequestMatcher(
                    requestMatcherBuilder.matcher(HttpMethod.GET, "/logout"),
                    requestMatcherBuilder.matcher(HttpMethod.POST, "/logout")))
                .logoutSuccessHandler(logoutSuccessHandler));

        http.addFilterBefore(new NextUrlFilter(), OAuth2AuthorizationRequestRedirectFilter.class);


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
        DefaultRedirectStrategy defaultRedirectStrategy = new DefaultRedirectStrategy();
        SavedRequestAwareAuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();
        delegate.setRedirectStrategy((request, response, url) -> {
            String next = (String) request.getSession().getAttribute(NEXT_URL_SESSION_ATTRIBUTE);

            if (next != null) {
                request.getSession().removeAttribute(NEXT_URL_SESSION_ATTRIBUTE);
                response.sendRedirect(next);
            } else {
                defaultRedirectStrategy.sendRedirect(request, response, url);
            }
        });

        return (request, response, authentication) -> {

            OAuth2AuthenticationToken oauthToken =
                (OAuth2AuthenticationToken) authentication;

            OAuth2AuthorizedClient client =
                authorizedClientService.loadAuthorizedClient(
                    oauthToken.getAuthorizedClientRegistrationId(),
                    oauthToken.getName());

            delegate.onAuthenticationSuccess(
                request,
                response,
                authentication);
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
