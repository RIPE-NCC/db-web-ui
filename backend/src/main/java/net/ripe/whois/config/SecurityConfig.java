package net.ripe.whois.config;

import com.hazelcast.core.HazelcastInstance;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import net.ripe.whois.config.hazelcast.HazelcastOAuth2AuthorizedClientService;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import net.ripe.whois.services.SessionEmitterService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientPropertiesMapper;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
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
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.AuthorizedClientServiceOAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProvider;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientProviderBuilder;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.oidc.authentication.logout.OidcLogoutToken;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionRegistry;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.AuthenticatedPrincipalOAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.client.web.client.OAuth2ClientHttpRequestInterceptor;
import org.springframework.security.oauth2.core.OAuth2AuthorizationException;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.session.config.SessionRepositoryCustomizer;
import org.springframework.session.hazelcast.HazelcastIndexedSessionRepository;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

import static net.ripe.whois.config.NextUrlFilter.NEXT_URL_SESSION_ATTRIBUTE;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(OAuth2ClientProperties.class)
public class SecurityConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityConfig.class);

    private static final List<String> IDP_UNAVAILABLE_ERROR_CODES = List.of("server_error", "temporarily_unavailable");

    private static final List<String> SILENT_LOGIN_FAILURE_ERROR_CODES = List.of("login_required", "interaction_required");

    @Bean
    public SecurityFilterChain securityFilterChain(final HttpSecurity http,
                                            final SilentAwareAuthorizationRequestResolver silentAwareResolver,
                                            final AuthenticationSuccessHandler authenticationSuccessHandler,
                                            final AuthenticationFailureHandler oauth2LoginFailureHandler,
                                            final OidcClientInitiatedLogoutSuccessHandler logoutSuccessHandler,
                                            final OidcBackChannelLogoutHandler oidcLogoutHandler,
                                            final LogoutHandler cleanUpAllCachesOnClientOnBackChannelLogout,
                                            final OAuth2AuthorizedClientRepository authorizedClientRepository
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
                    oauth.failureHandler(oauth2LoginFailureHandler);
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
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
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



    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName(OidcUtils.OIDC_LOCAL_COOKIE_NAME);
        return serializer;
    }

    @Bean
    @Profile("!test-it")
    public OAuth2AuthorizedClientManager authorizedClientManager(
            final ClientRegistrationRepository clientRegistrationRepository,
            final OAuth2AuthorizedClientService authorizedClientService) {

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
    public RestClient oauth2RestClient(final OAuth2AuthorizedClientManager authorizedClientManager,
                                       final RestClient.Builder restClientBuilder) {
        final OAuth2ClientHttpRequestInterceptor requestInterceptor =
                new OAuth2ClientHttpRequestInterceptor(authorizedClientManager);
        requestInterceptor.setClientRegistrationIdResolver(request -> OidcUtils.REGISTRATION_ID);

        return restClientBuilder
                .requestInterceptor(requestInterceptor)
                .build();
    }

    // Logout from the provider when a user logout from the application
    @Bean
    public OidcClientInitiatedLogoutSuccessHandler oidcLogoutSuccessHandler(
        final ClientRegistrationRepository clientRegistrationRepository) {

        OidcClientInitiatedLogoutSuccessHandler handler =
            new OidcClientInitiatedLogoutSuccessHandler(
                clientRegistrationRepository);

        handler.setPostLogoutRedirectUri("{baseUrl}/query");

        return handler;
    }

    @Bean
    public OAuth2AuthorizedClientRepository authorizedClientRepository(final OAuth2AuthorizedClientService authorizedClientService) {
        return new AuthenticatedPrincipalOAuth2AuthorizedClientRepository(authorizedClientService);
    }


    // Hazelcast instances
    @Bean
    public OAuth2AuthorizedClientService authorizedClientService(final HazelcastInstance hazelcastInstance) {
        return new HazelcastOAuth2AuthorizedClientService(hazelcastInstance);
    }

    @Bean
    public OidcSessionRegistry oidcSessionRegistry(final HazelcastInstance hazelcastInstance) {
        return new HazelcastOidcSessionRegistry(hazelcastInstance);
    }

    @Bean
    public SessionRepositoryCustomizer<HazelcastIndexedSessionRepository> sessionTimeoutCustomizer(
            @Value("${server.servlet.session.timeout}") Duration sessionTimeout) {
        return repository -> repository.setDefaultMaxInactiveInterval(sessionTimeout);
    }

    // Logout from the application when a user logout from the provider

    @Bean
    public OidcBackChannelLogoutHandler oidcLogoutHandler(final OidcSessionRegistry sessionRegistry) {
        OidcBackChannelLogoutHandler handler = new OidcBackChannelLogoutHandler(sessionRegistry);
        handler.setSessionCookieName(OidcUtils.OIDC_LOCAL_COOKIE_NAME);
        return handler;
    }

    @Bean
    public LogoutHandler cleanUpAllCachesOnClientOnBackChannelLogout(final OidcSessionRegistry oidcSessionRegistry,
                                                              final HazelcastInstance hazelcastInstance,
                                                              final SessionEmitterService sessionEmitterService) {
        return (request, response, authentication) -> {
            if (!(authentication.getPrincipal() instanceof OidcLogoutToken logoutToken)) {
                LOGGER.debug("Not an OIDC logout token: {}", authentication.getPrincipal());
                return;
            }
            final Iterable<OidcSessionInformation> matched = oidcSessionRegistry.removeSessionInformation(logoutToken);
            var sessionsMap = hazelcastInstance.getMap(OidcUtils.HTTP_SESSION_CACHE);

            for (OidcSessionInformation info : matched) {
                sessionEmitterService.notifyExpired(info.getSessionId());
                sessionsMap.remove(info.getSessionId());
            }
        };
    }

    // silent login
    @Bean
    public SilentAwareAuthorizationRequestResolver silentAwareResolver(ClientRegistrationRepository clientRegistrationRepository) {
        return new SilentAwareAuthorizationRequestResolver(clientRegistrationRepository, OidcUtils.IDP_AUTHORISATION_ENDPOINT);
    }

    //Error handling

    /***
     * <p>
     * Creates an internal filter that intercepts OAuth2AuthorizationRequestRedirectFilter which is the responsible
     * for handling /oauth2/authorization/{registrationId} requests.
     * In case someone tries /oauth2/authorization/bad-idp it will fail before hitting the IdP
     *
     */
    @Bean
    @Primary
    public ObjectPostProcessor<Object> oauth2FilterFailureHandlerPostProcessor(
            @Qualifier("objectPostProcessor") final ObjectPostProcessor<Object> objectPostProcessor,
            final AuthenticationFailureHandler oauth2AuthorizationRequestFailureHandler) {
        return new ObjectPostProcessor<>() {
            @Override
            public <O> O postProcess(final O object) {
                final O processed = objectPostProcessor.postProcess(object);
                if (processed instanceof OAuth2AuthorizationRequestRedirectFilter filter) {
                    filter.setAuthenticationFailureHandler(oauth2AuthorizationRequestFailureHandler);
                }
                return processed;
            }
        };
    }

    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return (request, response, exception) -> {
            logReason(exception);
            final String redirectUrl = UriComponentsBuilder.fromUriString("/db-web-ui/error")
                    .queryParam("idpError")
                    .build()
                    .toUriString();


            response.sendRedirect(redirectUrl);
        };
    }

    private void logReason(AuthenticationException exception) {
        if (exception.getCause() instanceof OAuth2AuthorizationException authEx) {
            LOGGER.error("Authentication failure, error code is {} — actual exception:", authEx.getError().getErrorCode(), exception);
        }
        LOGGER.error("Authentication failure — actual exception:", exception);

    }

    @Bean
    public AuthenticationFailureHandler oauth2LoginFailureHandler(AuthenticationFailureHandler authenticationFailureHandler) {
        return (request, response, exception) -> {
            final String error = request.getParameter("error");
            final String next = (String) request.getSession().getAttribute(NEXT_URL_SESSION_ATTRIBUTE);

            if (StringUtils.isNotEmpty(error) && SILENT_LOGIN_FAILURE_ERROR_CODES.contains(error)) {
                handleSilentLoginFailure(request, response, next);
                return;
            }
            if (isIdpUnavailable(exception)) {
                handleIdpUnavailableFailure(request, response, exception, next);
                return;
            }

            authenticationFailureHandler.onAuthenticationFailure(request, response, exception);
        };
    }

    /***
     * <p>
     * Handles the case when IdP is not available.
     *
     */
    @Bean
    public AuthenticationFailureHandler oauth2AuthorizationRequestFailureHandler() {
        return (request, response, exception) -> {

            final String isSilent = request.getParameter("silent");
            if ("true".equals(isSilent)) {
                // IdP is not available, so we expect the error before calling IdP.
                final String next = (String) request.getSession().getAttribute(NEXT_URL_SESSION_ATTRIBUTE);
                handleSilentLoginFailure(request, response, next);
                return;
            }

            final String registrationId = OidcUtils.extractRegistrationId(request);
            if (!OidcUtils.REGISTRATION_ID.equals(registrationId)){
                LOGGER.error("Invalid client registrationId {}", registrationId);
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid client registrationId");
                return;
            }

            //falls back to default
            LOGGER.error("Error coming form the IdP");
            new SimpleUrlAuthenticationFailureHandler().onAuthenticationFailure(request, response, exception);
        };
    }

    private void handleIdpUnavailableFailure(final HttpServletRequest request, final HttpServletResponse response,
                                             final AuthenticationException exception, final String next) throws IOException {
        cleanupPreAuthSession(request, response);
        final String redirectUrl = UriComponentsBuilder.fromUriString(StringUtils.isEmpty(next) ? "/query" : next)
                .queryParam("loginUnavailable", "true")
                .build()
                .toUriString();
        LOGGER.error("IdP unavailable during login, redirecting to {} without authentication", redirectUrl, exception);
        response.sendRedirect(redirectUrl);
    }

    private void handleSilentLoginFailure(final HttpServletRequest request, final HttpServletResponse response,
                                          final String next) throws IOException {
        cleanupPreAuthSession(request, response);
        final String redirectUrl = UriComponentsBuilder.fromUriString(StringUtils.isEmpty(next) ? "/query" : next)
                .queryParam("silentLoginFailed", "true")
                .build()
                .toUriString();
        LOGGER.debug("Silent login: User not logged in, redirecting to {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }

    /***
     * <p>
     * Avoid failing startup if the IdP is not available.
     */
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository(final OAuth2ClientProperties properties) {
        try {
            final List<ClientRegistration> registrations =
                    new OAuth2ClientPropertiesMapper(properties).asClientRegistrations().values().stream().toList();
            return new InMemoryClientRegistrationRepository(registrations);
        } catch (Exception e) {
            LOGGER.error("OIDC discovery failed at startup (IdP unavailable) — starting without OAuth2 login until restart: ", e);
            return registrationId -> null; // any login attempt will now fail cleanly downstream, rather than blocking startup
        }
    }

    //http Firewall
    @Bean
    public HttpFirewall allowUrlEncodedPercentHttpFirewall() {
        final StrictHttpFirewall firewall = new StrictHttpFirewall();
        firewall.setAllowUrlEncodedPercent(true);
        firewall.setAllowUrlEncodedSlash(true);
        return firewall;
    }

    private CookieCsrfTokenRepository cookieCsrfTokenRepository() {
        CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        repository.setCookieName(OidcUtils.OIDC_CSRF_COOKIE_NAME);
        return repository;
    }

    private boolean isIdpUnavailable(final AuthenticationException exception) {
        if (exception.getCause() instanceof OAuth2AuthorizationException authEx) {
            final String errorCode = authEx.getError().getErrorCode();
            return IDP_UNAVAILABLE_ERROR_CODES.contains(errorCode);
        }
        return false;
    }

    private void cleanupPreAuthSession(HttpServletRequest request, HttpServletResponse response) {
        final HttpSession session = request.getSession(false);
        if (session != null) {
            session.removeAttribute(NEXT_URL_SESSION_ATTRIBUTE);
            session.invalidate();
        }
        clearSessionCookie(response);
    }

    private void clearSessionCookie(HttpServletResponse response) {
        final Cookie cookie = new Cookie(OidcUtils.OIDC_LOCAL_COOKIE_NAME, "");
        cookie.setPath("/db-web-ui"); // must match whatever path your session cookie is actually issued with
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        response.addCookie(cookie);
    }
}
