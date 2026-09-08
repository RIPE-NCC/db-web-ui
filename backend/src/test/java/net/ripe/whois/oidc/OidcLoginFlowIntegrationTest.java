package net.ripe.whois.oidc;

import com.hazelcast.core.HazelcastInstance;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry;
import net.ripe.whois.services.SessionCacheService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;

import static net.ripe.whois.config.hazelcast.HazelcastOAuth2AuthorizedClientService.MAP_NAME;
import static net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP;
import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.aMapWithSize;
import static org.hamcrest.Matchers.anEmptyMap;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;

@Import(OidcTestConfig.class)
class OidcLoginFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private HazelcastInstance hazelcastInstance;
    @Autowired
    private KeycloakIdPDummyService keycloakIdPDummyService;
    @Autowired
    private SessionCacheService sessionCacheService;
    @Autowired
    private AtomicBoolean authorizeShouldFail;

    @AfterEach
    void resetAuthorizeFlag() {
        authorizeShouldFail.set(false);
    }

    @BeforeEach
    void resetCaches() {
        keycloakIdPDummyService.clear();
        hazelcastInstance.getMap("spring:session:sessions").clear();
        hazelcastInstance.getMap("oidc-session-registry").clear();
        hazelcastInstance.getMap("oauth2-authorized-clients").clear();
    }

    @Test
    void login_sendsPkce_and_populates_all_Caches() {
        // 1. Hit the login-start endpoint anonymously (no bearer token) so we don't
        // interfere with the OAuth2 flow with an unrelated auth header.
        keycloakIdPDummyService.registerUser("test-code", new KeycloakIdPDummyService.FakeUser("test-user", "test.user@example.com", "idp" +
                "-session-1"));

        final HttpEntity<Void> anonymousRequest = new HttpEntity<>(null, new HttpHeaders());

        final ResponseEntity<String> authStart = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/oauth2/authorization/keycloak",
                HttpMethod.GET,
                anonymousRequest,
                String.class);

        assertThat(authStart.getStatusCode().value(), is(302));
        final String authorizeUrl = authStart.getHeaders().getLocation().toString();

        // 2. The actual regression assertion for the PKCE bug
        assertThat(authorizeUrl, containsString("code_challenge="));
        assertThat(authorizeUrl, containsString("code_challenge_method=S256"));

        // 3. Extract state + session cookie to continue the flow
        final String state = extractQueryParam(authorizeUrl, "state");
        final String sessionCookie = extractSessionCookie(authStart);

        final HttpHeaders callbackHeaders = new HttpHeaders();
        callbackHeaders.add(HttpHeaders.COOKIE, sessionCookie);
        final HttpEntity<Void> callbackRequest = new HttpEntity<>(null, callbackHeaders);

        // 4. Simulate Keycloak's callback with our fake auth code
        final ResponseEntity<String> callback = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/login/oauth2/code/keycloak?code=test-code&state=" + state,
                HttpMethod.GET,
                callbackRequest,
                String.class);

        assertThat(callback.getStatusCode().value(), is(302));

        // 5. Confirm all three Hazelcast caches got populated
        final Map<Object, Object> sessions = hazelcastInstance.getMap("spring:session:sessions");
        final Map<Object, Object> oidcSessions = hazelcastInstance.getMap(OIDC_SESSIONS_MAP);
        final Map<Object, Object> authorizedClients = hazelcastInstance.getMap(MAP_NAME);

        assertThat(sessions.keySet(), hasSize(1));
        assertThat(oidcSessions.keySet(), hasSize(1));
        assertThat(authorizedClients.keySet(), hasSize(1));
    }

    @Test
    void silent_login_failure_redirects_to_next_with_market() {
        final HttpEntity<Void> anonymousRequest = new HttpEntity<>(null, new HttpHeaders());
        final String nextUrl = getServerUrl() + "/db-web-ui/syncupdates";

        final String silentLoginUrl = UriComponentsBuilder.fromHttpUrl(getServerUrl() + "/db-web-ui/oauth2/authorization/keycloak")
                .queryParam("silent", "true")
                .queryParam("next", nextUrl) // raw, undecoded value — builder encodes it exactly once
                .build()
                .toUriString();

        final ResponseEntity<String> authStart = restTemplate.exchange(
                silentLoginUrl, HttpMethod.GET, anonymousRequest, String.class);

        final String authorizeUrl = authStart.getHeaders().getLocation().toString();
        assertThat(authorizeUrl, containsString("prompt=none"));

        final String state = extractQueryParam(authorizeUrl, "state");
        final String sessionCookie = extractSessionCookie(authStart);

        final HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, sessionCookie);

        final String callbackUrl = UriComponentsBuilder.fromHttpUrl(getServerUrl() + "/db-web-ui/login/oauth2/code/keycloak")
                .queryParam("error", "login_required")
                .queryParam("state", state)
                .toUriString();

        final ResponseEntity<String> callback = restTemplate.exchange(
                callbackUrl, HttpMethod.GET, new HttpEntity<>(null, headers), String.class);

        final String finalRedirect = callback.getHeaders().getLocation().toString();

        assertThat(finalRedirect, containsString("/db-web-ui/syncupdates"));
        assertThat(finalRedirect, containsString("silentLoginFailed=true"));
    }

    @Test
    void subscribe_while_connected_then_cache_expires_triggers_push_event() throws Exception {
        keycloakIdPDummyService.registerUser("expiry-test-code",
                new KeycloakIdPDummyService.FakeUser("expiry-user", "expiry@example.com", "idp-sid-expiry"));

        final String sessionCookie = performFullLoginAndGetSessionCookie("expiry-test-code");
        final String sessionId = extractSessionId(sessionCookie);

        final HttpClient client = HttpClient.newHttpClient();
        final HttpRequest sseRequest = HttpRequest.newBuilder()
                .uri(URI.create(getServerUrl() + "/db-web-ui/api/session/events"))
                .header(HttpHeaders.COOKIE, sessionCookie)
                .GET()
                .build();

        var future = client.sendAsync(sseRequest, HttpResponse.BodyHandlers.ofString());

        await().atMost(5, TimeUnit.SECONDS)
                .pollInterval(50, TimeUnit.MILLISECONDS)
                .until(() -> sessionCacheService.hasActiveEmitter(sessionId));

        // Now force expiry while the connection is confirmed open.
        hazelcastInstance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP)
                .setTtl(sessionId, 1, TimeUnit.SECONDS);

        final HttpResponse<String> response = future.get(10, TimeUnit.SECONDS);

        assertThat(response.body(), containsString("session-expired"));
        assertThat(((Map<Object, Object>) hazelcastInstance.getMap(HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP))
                .containsKey(sessionId), is(false));
    }

    @Test
    void subscribe_after_cache_already_expired_triggers_immediate_expiration_event() throws Exception {
        keycloakIdPDummyService.registerUser("expiry-test-code-2",
                new KeycloakIdPDummyService.FakeUser("expiry-user-2", "expiry2@example.com", "idp-sid-expiry-2"));

        final String sessionCookie = performFullLoginAndGetSessionCookie("expiry-test-code-2");
        final String sessionId = extractSessionId(sessionCookie);

        // Force expiry BEFORE subscribing at all.
        hazelcastInstance.getMap(OIDC_SESSIONS_MAP).setTtl(sessionId, 1, TimeUnit.SECONDS);
        // Give Hazelcast a moment to actually evict the entry — TTL eviction isn't instantaneous.
        Thread.sleep(1500);

        assertThat(((Map<Object, Object>) hazelcastInstance.getMap(OIDC_SESSIONS_MAP)).containsKey(sessionId), is(false));

        final HttpClient client = HttpClient.newHttpClient();
        final HttpRequest sseRequest = HttpRequest.newBuilder()
                .uri(URI.create(getServerUrl() + "/db-web-ui/api/session/events"))
                .header(HttpHeaders.COOKIE, sessionCookie)
                .GET()
                .build();

        // Subscribing now should get the event immediately, synchronously in this same
        // response, rather than depending on any future push.
        final HttpResponse<String> response = client.send(sseRequest, HttpResponse.BodyHandlers.ofString());

        assertThat(response.body(), containsString("session-expired"));
    }

    @Test
    void two_users_produce_two_separate_cacheEntries() {
        keycloakIdPDummyService.registerUser("user1-code",
                new KeycloakIdPDummyService.FakeUser("user-one", "one@example.com", "idp-sid-1"));
        keycloakIdPDummyService.registerUser("user2-code",
                new KeycloakIdPDummyService.FakeUser("user-two", "two@example.com", "idp-sid-2"));

        performFullLoginAndGetSessionCookie("user1-code");
        performFullLoginAndGetSessionCookie("user2-code");

        Map<Object, Object> sessions = hazelcastInstance.getMap("spring:session:sessions");
        Map<Object, Object> oidcSessions = hazelcastInstance.getMap(OIDC_SESSIONS_MAP);
        Map<Object, Object> authorizedClients = hazelcastInstance.getMap(MAP_NAME);

        assertThat(sessions).hasSize(2);
        assertThat(oidcSessions).hasSize(2);
        assertThat(authorizedClients).hasSize(2); // keyed by registrationId:principalName — confirms different keys for different users
    }

    @Test
    void backChannelLogout_removes_session_from_caches_and_expires() throws ExecutionException, InterruptedException,
            TimeoutException {

        keycloakIdPDummyService.registerUser("bcl-test-code",
                new KeycloakIdPDummyService.FakeUser("bcl-user", "bcl@example.com", "idp-sid-bcl"));

        final String sessionCookie = performFullLoginAndGetSessionCookie("bcl-test-code");
        final String sessionId = extractSessionId(sessionCookie);

        final HttpClient client = HttpClient.newHttpClient();
        final HttpRequest sseRequest = HttpRequest.newBuilder()
                .uri(URI.create(getServerUrl() + "/db-web-ui/api/session/events"))
                .header(HttpHeaders.COOKIE, sessionCookie)
                .GET()
                .build();
        var future = client.sendAsync(sseRequest, HttpResponse.BodyHandlers.ofString());
        await().atMost(5, TimeUnit.SECONDS)
                .pollInterval(50, TimeUnit.MILLISECONDS)
                .until(() -> sessionCacheService.hasActiveEmitter(sessionId));

        // Sanity check: session genuinely exists in all three caches before logout
        assertThat((Map<Object, Object>) hazelcastInstance.getMap("spring:session:sessions"), aMapWithSize(1));
        assertThat((Map<Object, Object>) hazelcastInstance.getMap(OIDC_SESSIONS_MAP), aMapWithSize(1));
        assertThat((Map<Object, Object>) hazelcastInstance.getMap(MAP_NAME), aMapWithSize(1));

        String logoutToken = TestJwtSupport.logoutToken(
                "http://localhost:" + testJwksServer.getPort() + "/realms/ripe-ncc",
                "bcl-user",
                "idp-sid-bcl");

        String rawBody = "logout_token=" + java.net.URLEncoder.encode(logoutToken, StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>(rawBody, headers);

        ResponseEntity<String> logoutResponse = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/logout/connect/back-channel/keycloak",
                HttpMethod.POST,
                entity,
                String.class);

        assertThat(logoutResponse.getStatusCode().value(), is(200));

        final HttpResponse<String> response = future.get(10, TimeUnit.SECONDS);

        assertThat(response.body(), containsString("session-expired"));
        // Confirm the REAL caches were actually cleared as a result
        assertThat((Map<Object, Object>) hazelcastInstance.getMap("spring:session:sessions"), anEmptyMap());
        // Back-channel logout just removes session specific cache
        //assertThat((Map<Object, Object>) hazelcastInstance.getMap(MAP_NAME), anEmptyMap());
        assertThat((Map<Object, Object>) hazelcastInstance.getMap(OIDC_SESSIONS_MAP), anEmptyMap());
    }

    @Test
    void wrong_registry_call_should_400() {
        HttpEntity<Void> anonymousRequest = new HttpEntity<>(null, new HttpHeaders());

        final ResponseEntity<String> response = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/oauth2/authorization/wrongRegistry",
                HttpMethod.GET, anonymousRequest, String.class);

        assertThat(response.getStatusCode().value(), is(400));
        assertThat(response.getBody(), containsString("/db-web-ui/oauth2/authorization/wrongRegistry"));
    }

    // Simulate IdP Outages
    @Test
    void idp_timeout_during_token_exchange_redirects_without_login_and_clears_caches() {
        keycloakIdPDummyService.registerTimeout("timeout-code");

        final HttpEntity<Void> anonymousRequest = new HttpEntity<>(null, new HttpHeaders());
        final ResponseEntity<String> authStart = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/oauth2/authorization/keycloak",
                HttpMethod.GET, anonymousRequest, String.class);

        final String authorizeUrl = authStart.getHeaders().getLocation().toString();
        final String state = extractQueryParam(authorizeUrl, "state");
        final String sessionCookie = extractSessionCookie(authStart);

        final HttpHeaders callbackHeaders = new HttpHeaders();
        callbackHeaders.add(HttpHeaders.COOKIE, sessionCookie);

        final URI callbackUri = UriComponentsBuilder.fromHttpUrl(getServerUrl() + "/db-web-ui/login/oauth2/code/keycloak")
                .queryParam("code", "timeout-code")
                .queryParam("state", state)
                .build()
                .toUri();

        final ResponseEntity<String> callback = restTemplate.exchange(
                callbackUri, HttpMethod.GET, new HttpEntity<>(null, callbackHeaders), String.class);

        // An IdP outage during token exchange should NOT dead-end on /login?error —
        // it should route the user back to the app (next, or /query) unauthenticated,
        // flagged with loginUnavailable=true, rather than blocking them entirely.
        assertThat(callback.getStatusCode().value(), is(302));
        final String redirect = callback.getHeaders().getLocation().toString();
        assertThat(redirect, containsString("/query"));
        assertThat(redirect, containsString("loginUnavailable=true"));

        // Confirm the failed exchange never populated the post-login caches.
        assertThat((Map<Object, Object>) hazelcastInstance.getMap(OIDC_SESSIONS_MAP), anEmptyMap());
        assertThat((Map<Object, Object>) hazelcastInstance.getMap(MAP_NAME), anEmptyMap());
    }

    @Test
    void authorized_request_when_idp_unreachable_returns_unauthorized() {
        keycloakIdPDummyService.registerUser("idp-down-code",
                new KeycloakIdPDummyService.FakeUser("idp-down-user", "idp-down@example.com", "idp-sid-down"));

        // Log in normally first — succeeds, since login doesn't consult
        // authorizedClientManager at all
        final String sessionCookie = performFullLoginAndGetSessionCookie("idp-down-code");

        // Now simulate the IdP being unreachable on a subsequent authorize()/refresh call.
        authorizeShouldFail.set(true);

        final HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, sessionCookie);

        final ResponseEntity<String> response = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20",
                HttpMethod.GET, new HttpEntity<>(null, headers), String.class);

        assertThat(response.getStatusCode().value(), is(401));
    }

    @Test
    void authorized_request_when_idp_recovers_succeeds_again() {
        keycloakIdPDummyService.registerUser("idp-recovers-code",
                new KeycloakIdPDummyService.FakeUser("idp-recovers-user", "idp-recovers@example.com", "idp-sid-recovers"));

        final String sessionCookie = performFullLoginAndGetSessionCookie("idp-recovers-code");

        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/resource-services/member-resources/7347", getResource("mock/member-resources-7347.json"));

        final HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, sessionCookie);
        final HttpEntity<Void> authenticatedRequest = new HttpEntity<>(null, headers);

        // First: IdP is down, request should fail.
        authorizeShouldFail.set(true);
        final ResponseEntity<String> failedResponse = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20",
                HttpMethod.GET, authenticatedRequest, String.class);
        assertThat(failedResponse.getStatusCode().value(), is(401));

        // IdP recovers — the same session should now work again without re-login.
        authorizeShouldFail.set(false);
        final ResponseEntity<String> recoveredResponse = restTemplate.exchange(
                getServerUrl() + "/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20",
                HttpMethod.GET, authenticatedRequest, String.class);
        assertThat(recoveredResponse.getStatusCode().value(), is(200));
    }
}