package net.ripe.whois.config;

import com.hazelcast.core.HazelcastInstance;
import jakarta.servlet.http.HttpSession;
import net.ripe.whois.config.hazelcast.HazelcastOAuth2AuthorizedClientService;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OidcBackChannelLogoutHandler;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthenticatedPrincipalOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import static net.ripe.whois.config.NextUrlFilter.NEXT_URL_SESSION_ATTRIBUTE;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            SilentAwareAuthorizationRequestResolver silentAwareResolver,
                                            AuthenticationSuccessHandler successHandler,
                                            OidcClientInitiatedLogoutSuccessHandler logoutSuccessHandler,
                                            OidcBackChannelLogoutHandler oidcLogoutHandler,
                                            LogoutHandler removeAuthorizedClientOnBackChannelLogout,
                                            OAuth2AuthorizedClientRepository authorizedClientRepository) throws Exception {

        PathPatternRequestMatcher.Builder requestMatcherBuilder = PathPatternRequestMatcher.withDefaults();


        http    // 1. Tell Spring to only create a session if it absolutely needs to (e.g., after login)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                // 2. Ensure CSRF does not force session creation for guests
                .csrf(csrf -> csrf
                        .csrfTokenRepository(cookieCsrfTokenRepository()) // Uses cookies insteadof HttpSession
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())    // Defers token loading
                )
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
                .requestMatchers("/public/**", "/api/healthcheck", "/api/whois-internal/api/user/info","/api/metadata/help", "/api/whois/search", "/api/whois/ripe/**").permitAll()
                .anyRequest().authenticated()
            )

            .oauth2Client(oauth2 -> oauth2
                    .authorizedClientRepository(authorizedClientRepository)
            )
            .oauth2Login(oauth -> {
                    oauth.authorizedClientRepository(authorizedClientRepository);
                    // Fetch credentials when loading page
                    oauth.authorizationEndpoint(endpoint -> endpoint.authorizationRequestResolver(silentAwareResolver));
                    oauth.failureHandler((request, response, exception) -> {
                        String error = request.getParameter("error");
                        if ("login_required".equals(error) || "interaction_required".equals(error)) {
                            String next = (String) request.getSession().getAttribute(NextUrlFilter.NEXT_URL_SESSION_ATTRIBUTE);
                            String baseUrl = next != null ? next : "/db-web-ui/";
                            String separator = baseUrl.contains("?") ? "&" : "?";
                            response.sendRedirect(baseUrl + separator + "silentLoginFailed");
                        } else {
                            response.sendRedirect("/db-web-ui/?loginError=true");
                        }
                    });
                    oauth.successHandler(successHandler);

                })
            .logout(logout -> logout
                .deleteCookies()
                .logoutRequestMatcher(new OrRequestMatcher(
                    requestMatcherBuilder.matcher(HttpMethod.GET, "/logout"),
                    requestMatcherBuilder.matcher(HttpMethod.POST, "/logout")))
                .logoutSuccessHandler(logoutSuccessHandler))
                .oidcLogout(logout -> logout
                        .backChannel(backChannel -> backChannel
                                .logoutHandler(oidcLogoutHandler)
                                .logoutHandler(removeAuthorizedClientOnBackChannelLogout)));

        http.addFilterBefore(new NextUrlFilter(), OAuth2AuthorizationRequestRedirectFilter.class);


        return http.build();
    }


    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler(OAuth2AuthorizedClientService authorizedClientService, RestTemplate restTemplate) {
        final DefaultRedirectStrategy defaultRedirectStrategy = new DefaultRedirectStrategy();
        final SavedRequestAwareAuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();
        delegate.setRedirectStrategy((request, response, url) -> {
            String next = (String) request.getSession().getAttribute(NEXT_URL_SESSION_ATTRIBUTE);
            LOGGER.debug("RedirectStrategy: next={} url={}", next, url);
            if (next != null) {
                request.getSession().removeAttribute(NEXT_URL_SESSION_ATTRIBUTE);
                response.sendRedirect(next);
            } else {
                defaultRedirectStrategy.sendRedirect(request, response, url);
            }
        });

        return delegate;
    }

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("DBSESSIONID");
        return serializer;
    }

    @Bean
    public OAuth2AuthorizedClientManager authorizedClientManager(
            ClientRegistrationRepository clientRegistrationRepository,
            OAuth2AuthorizedClientService authorizedClientService) {

        final OAuth2AuthorizedClientProvider authorizedClientProvider =
                OAuth2AuthorizedClientProviderBuilder.builder()
                        .authorizationCode()
                        .refreshToken()
                        .build();

        AuthorizedClientServiceOAuth2AuthorizedClientManager manager =
                new AuthorizedClientServiceOAuth2AuthorizedClientManager(clientRegistrationRepository, authorizedClientService);
        manager.setAuthorizedClientProvider(authorizedClientProvider);

        return manager;
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
    public OAuth2AuthorizedClientRepository authorizedClientRepository(OAuth2AuthorizedClientService authorizedClientService) {
        return new AuthenticatedPrincipalOAuth2AuthorizedClientRepository(authorizedClientService);
    }


    // Hazelcast instances
    @Bean
    public OAuth2AuthorizedClientService authorizedClientService(HazelcastInstance hazelcastInstance) {
        return new HazelcastOAuth2AuthorizedClientService(hazelcastInstance);
    }

    @Bean
    public OidcSessionRegistry oidcSessionRegistry(HazelcastInstance hazelcastInstance) {
        return new HazelcastOidcSessionRegistry(hazelcastInstance);
    }

    // Logout from the application when a user logout from the provider
    @Bean
    LogoutHandler oidcSessionRegistryCleanupHandler(OidcSessionRegistry sessionRegistry) {
        return (request, response, authentication) -> {
            HttpSession session = request.getSession(false);
            if (session != null) {
                sessionRegistry.removeSessionInformation(session.getId());
            }
        };
    }

    @Bean
    OidcBackChannelLogoutHandler oidcLogoutHandler(OidcSessionRegistry sessionRegistry) {
        OidcBackChannelLogoutHandler handler = new OidcBackChannelLogoutHandler(sessionRegistry);
        handler.setSessionCookieName("DBSESSIONID");
        return handler;
    }

    @Bean
    LogoutHandler removeAuthorizedClientOnBackChannelLogout(
            OAuth2AuthorizedClientService authorizedClientService) {
        return (request, response, authentication) -> {
            if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                String registrationId = oauthToken.getAuthorizedClientRegistrationId();
                String principalName = oauthToken.getName();

                authorizedClientService.removeAuthorizedClient(registrationId, principalName);

                LOGGER.debug("Removed authorized client on back-channel logout from HZ: registrationId={} principal={}",
                        registrationId, principalName);
            }
        };
    }

    // silent login
    @Bean
    public SilentAwareAuthorizationRequestResolver silentAwareResolver(ClientRegistrationRepository clientRegistrationRepository) {
        return new SilentAwareAuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
    }

    private CookieCsrfTokenRepository cookieCsrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieName("DBCSRFTOKEN");
        return repository;
    }
}
