package net.ripe.whois.config;

import com.hazelcast.core.HazelcastInstance;
import jakarta.servlet.http.HttpServletResponse;
import net.ripe.whois.config.hazelcast.HazelcastOAuth2AuthorizedClientService;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import net.ripe.whois.services.SessionCacheService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.ObjectPostProcessor;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OidcBackChannelLogoutHandler;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.oidc.authentication.logout.OidcLogoutToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthenticatedPrincipalOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import static net.ripe.whois.config.NextUrlFilter.NEXT_URL_SESSION_ATTRIBUTE;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            SilentAwareAuthorizationRequestResolver silentAwareResolver,
                                            AuthenticationSuccessHandler authenticationSuccessHandler,
                                            AuthenticationFailureHandler authenticationFailureHandler,
                                            OidcClientInitiatedLogoutSuccessHandler logoutSuccessHandler,
                                            OidcBackChannelLogoutHandler oidcLogoutHandler,
                                            LogoutHandler cleanUpAllCachesOnClientOnBackChannelLogout,
                                            OAuth2AuthorizedClientRepository authorizedClientRepository
                                            ) throws Exception {

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
                        .requestMatchers("/**").permitAll()
                        .anyRequest().permitAll()
            )

            .oauth2Client(oauth2 -> oauth2
                    .authorizedClientRepository(authorizedClientRepository)
            )
            .oauth2Login(oauth -> {
                    oauth.authorizedClientRepository(authorizedClientRepository);
                    // Fetch credentials when loading page
                    oauth.authorizationEndpoint(endpoint -> endpoint.authorizationRequestResolver(silentAwareResolver));
                    oauth.failureHandler((request, response, exception) -> {
                        final String error = request.getParameter("error");
                        if ("login_required".equals(error) || "interaction_required".equals(error)) {
                            final String next = (String) request.getSession().getAttribute(NEXT_URL_SESSION_ATTRIBUTE);
                            LOGGER.debug("Next is {}", next);
                            request.getSession().removeAttribute(NEXT_URL_SESSION_ATTRIBUTE);
                            final String redirectUrl = UriComponentsBuilder.fromUriString(StringUtils.isEmpty(next) ? "/query": next)
                                    .queryParam("silentLoginFailed", "true")
                                    .build()
                                    .toUriString();
                            LOGGER.debug("Silent login failed, redirecting to {}", redirectUrl);
                            response.sendRedirect(redirectUrl);
                        } else {
                            authenticationFailureHandler.onAuthenticationFailure(request, response, exception);
                        }

                    });
                    oauth.successHandler(authenticationSuccessHandler);

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
                                .logoutHandler(cleanUpAllCachesOnClientOnBackChannelLogout)));

        http.addFilterBefore(new NextUrlFilter(), OAuth2AuthorizationRequestRedirectFilter.class);

        return http.build();
    }


    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler(OAuth2AuthorizedClientService authorizedClientService, RestTemplate restTemplate) {
        final DefaultRedirectStrategy defaultRedirectStrategy = new DefaultRedirectStrategy();
        final SavedRequestAwareAuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();
        delegate.setRedirectStrategy((request, response, url) -> {
            final String next = (String) request.getSession().getAttribute(NEXT_URL_SESSION_ATTRIBUTE);
            if (StringUtils.isEmpty(next)) {
                defaultRedirectStrategy.sendRedirect(request, response, url);
                return;
            }
            request.getSession().removeAttribute(NEXT_URL_SESSION_ATTRIBUTE);
            response.sendRedirect(next);
        });

        return delegate;
    }

    /**
     * Stores exception in HttpSession and redirect to /login?error - IdP will display an error message
     */
    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return new SimpleUrlAuthenticationFailureHandler("/login?error");
    }


    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName(OidcUtils.OIDC_LOCAL_COOKIE_NAME);
        return serializer;
    }

    @Bean
    @Profile("!test")
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
        requestInterceptor.setClientRegistrationIdResolver(request -> OidcUtils.REGISTRATION_ID);

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
    OidcBackChannelLogoutHandler oidcLogoutHandler(OidcSessionRegistry sessionRegistry) {
        OidcBackChannelLogoutHandler handler = new OidcBackChannelLogoutHandler(sessionRegistry);
        handler.setSessionCookieName(OidcUtils.OIDC_LOCAL_COOKIE_NAME);
        return handler;
    }

    @Bean
    LogoutHandler cleanUpAllCachesOnClientOnBackChannelLogout(OAuth2AuthorizedClientService authorizedClientService,
                                                              OidcSessionRegistry oidcSessionRegistry,
                                                              HazelcastInstance hazelcastInstance,
                                                              SessionCacheService sessionCacheService) {
        return (request, response, authentication) -> {
            if (!(authentication.getPrincipal() instanceof OidcLogoutToken logoutToken)) {
                LOGGER.info("Not an OIDC logout token: {}", authentication.getPrincipal());
                return;
            }

            final String principalName = logoutToken.getSubject();
            authorizedClientService.removeAuthorizedClient(OidcUtils.REGISTRATION_ID, principalName);

            final Iterable<OidcSessionInformation> matched = oidcSessionRegistry.removeSessionInformation(logoutToken);

            var sessionsMap = hazelcastInstance.getMap("spring:session:sessions");
            for (OidcSessionInformation info : matched) {
                LOGGER.info("session that should be explired is {}", info.getSessionId())
                sessionCacheService.notifyExpired(info.getSessionId());
                sessionsMap.remove(info.getSessionId());
            }
        };
    }

    // silent login
    @Bean
    public SilentAwareAuthorizationRequestResolver silentAwareResolver(ClientRegistrationRepository clientRegistrationRepository) {
        return new SilentAwareAuthorizationRequestResolver(clientRegistrationRepository, OidcUtils.IDP_AUTHORISATION_ENDPOINT);
    }

    private CookieCsrfTokenRepository cookieCsrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieName(OidcUtils.OIDC_CSRF_COOKIE_NAME);
        return repository;
    }

    //Error handling
    @Bean
    @Primary
    public ObjectPostProcessor<Object> oauth2FilterFailureHandlerPostProcessor(
            @Qualifier("objectPostProcessor") final ObjectPostProcessor<Object> objectPostProcessor) {
        return new ObjectPostProcessor<>() {
            @Override
            public <O> O postProcess(final O object) {
                final O processed = objectPostProcessor.postProcess(object);
                if (processed instanceof OAuth2AuthorizationRequestRedirectFilter filter) {
                    filter.setAuthenticationFailureHandler((request, response, exception) -> {
                        LOGGER.warn("Invalid OAuth2 authorization request: {}", exception.getMessage());
                        response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid client registration");
                    });
                }
                return processed;
            }
        };
    }
}
