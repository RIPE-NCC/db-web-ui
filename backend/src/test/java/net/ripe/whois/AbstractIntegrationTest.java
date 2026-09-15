package net.ripe.whois;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import com.google.common.util.concurrent.Uninterruptibles;
import net.ripe.whois.config.OidcUtils;
import net.ripe.whois.oidc.TestJwksDummyService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Base integration testing class for db-web-ui.
 * <p>
 * Ref:
 * https://spring.io/blog/2016/04/15/testing-improvements-in-spring-boot-1-4
 * http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html
 * <p>
 * The @DirtiesContext is necessary because the Mock server is restarted and assigned a different port but the
 * Spring injection for whois api url etc is not performed between test class runs so the url and actual mock server
 * port are then out of sync. @DirtiesContext forces the context to be reinitialised, thus fixing this problem.
 */
@ExtendWith(SpringExtension.class)
@ActiveProfiles(profiles = "test-it")
@SpringBootTest(classes = {Application.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
public abstract class AbstractIntegrationTest {

    protected static final OAuth2AccessToken ACCESS_TOKEN = new OAuth2AccessToken(
            OAuth2AccessToken.TokenType.BEARER,
            "mock-access-token",
            Instant.now(),
            Instant.now().plusSeconds(3600)
    );


    @Autowired
    protected Environment environment;

    @Autowired
    protected ApplicationContext applicationContext;

    @Autowired
    protected TestRestTemplate restTemplate;

    @Value("${local.server.port}")
    private int localServerPort;

    protected static HttpServerMock httpServerMock;

    private static String jettyRequestLogFile = createJettyRequestLogFile();

    protected static TestJwksDummyService testJwksServer;

    @BeforeAll
    static void setupJwks() {
        testJwksServer = new TestJwksDummyService();
        testJwksServer.start();
        int port = testJwksServer.getPort();

        System.setProperty("spring.security.oauth2.client.provider.keycloak.jwk-set-uri",
                "http://localhost:" + port + "/test-jwks");
        System.setProperty("spring.security.oauth2.client.provider.keycloak.issuer-uri",
                "http://localhost:" + port + "/realms/ripe-ncc");
        System.setProperty("spring.security.oauth2.client.provider.keycloak.authorization-uri",
                "http://localhost:" + port + "/auth");
        System.setProperty("spring.security.oauth2.client.provider.keycloak.token-uri",
                "http://localhost:" + port + "/token");
        System.setProperty("spring.security.oauth2.client.provider.keycloak.user-info-uri",
                "http://localhost:" + port + "/userinfo");
        System.setProperty("server.servlet.session.timeout", "1h");
    }

    @AfterAll
    static void teardownJwks() {
        testJwksServer.stop();
    }

    @BeforeAll
    public static void beforeClass() {
        httpServerMock = new HttpServerMock();
        httpServerMock.start();

        System.setProperty("jetty.accesslog.filename", getJettyRequestLogFile());
        System.setProperty("portal.url", getMockServerUrl());
        System.setProperty("portal.url.account", getMockServerUrl());
        System.setProperty("portal.url.request", getMockServerUrl());
        System.setProperty("newest.portal.url", getMockServerUrl());
        System.setProperty("sso.access.url", getMockServerUrl());
        System.setProperty("sso.login.url", getMockServerUrl());
        System.setProperty("sso.logout.url", getMockServerUrl());
        System.setProperty("rest.api.ripeUrl", getMockServerUrl());
        System.setProperty("dns.checker.url", getMockServerUrl());
        System.setProperty("server.servlet.context-path", "/db-web-ui");
        System.setProperty("internal.api.url", getMockServerUrl());
        System.setProperty("internal.api.key", "123");
        System.setProperty("rsng.api.key", "OMG");
        System.setProperty("rsng.api.url", getMockServerUrl());
        System.setProperty("syncupdates.api.url", getMockServerUrl());
        System.setProperty("rest.search.url", getMockServerUrl());
        System.setProperty("lir.account.details.url", "https://my.prepdev.ripe.net/#/account-details");
        System.setProperty("lir.billing.details.url", "https://my.prepdev.ripe.net/#/billing");
        System.setProperty("lir.gm.preferences.url", "https://my.prepdev.ripe.net/#/meetings/44529bcf-7f19-4dc9-8f76-b9043a3973dd");
        System.setProperty("lir.user.accounts.url", "https://my.prepdev.ripe.net/#/contacts");
        System.setProperty("lir.tickets.url", "https://lirportal.prepdev.ripe.net/tickets/");
        System.setProperty("lir.training.url", "https://lirportal.prepdev.ripe.net/training/");
        System.setProperty("lir.api.access.keys.url", "https://lirportal.prepdev.ripe.net/api/");
        System.setProperty("spring.profiles.active", "test-it");
        System.setProperty("git.commit.id.abbrev", "0");
        System.setProperty("shutdown.pause.sec", "0");
        System.setProperty("bucket4j.enabled", "false");
        System.setProperty("ipranges.trusted","127.0.0.1,::1");
        System.setProperty("ripe.ncc.mntners","RIPE-NCC-HM-MNT, RIPE-NCC-END-MNT, RIPE-NCC-HM-PI-MNT, RIPE-GII-MNT, RIPE-DBM-MNT, RIPE-NCC-LOCKED-MNT, RIPE-ERX-MNT, RIPE-NCC-LEGACY-MNT, RIPE-NCC-MNT");
        System.setProperty("top.ripe.ncc.mntners","RIPE-NCC-HM-MNT, RIPE-NCC-END-MNT, RIPE-NCC-LEGACY-MNT");
        System.setProperty("ripe.ncc.hm.mnt","RIPE-NCC-HM-MNT");
        System.setProperty("rpki-validator.api.url","https://rpki-validator.ripe.net/api/v1/validity/");
        System.setProperty("show.api.key.menu","false");
        System.setProperty("OIDC_CLIENT_KEY","OIDC_CLIENT_KEY");
    }

    @AfterAll
    public static void afterClass() {
        httpServerMock.stop();
    }



    protected int getLocalServerPort() {
        return this.localServerPort;
    }

    protected void mock(final String uri, final String response) {
        httpServerMock.mock(uri, response);
    }

    public void mock(final String pathAndQuery, final String responseBody, final String contentType, final int responseStatusCode) {
        httpServerMock.mock(pathAndQuery, responseBody, contentType, responseStatusCode, null);
    }

    protected static String getMockServerUrl() {
        return String.format("http://localhost:%d", httpServerMock.getPort());
    }

    protected String getServerUrl() {
        return String.format("http://localhost:%d", this.localServerPort);
    }

    protected String getServerUrlHttps() {
        return String.format("https://localhost:%d", this.localServerPort);
    }

    protected String getServerUrlHttpsWithOutPort() {
        return "https://localhost";
    }

    private static String createJettyRequestLogFile() {
        try {
            final File tempFile = Files.createTempFile("jetty", "log").toFile();
            tempFile.deleteOnExit();
            return tempFile.getAbsolutePath();
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String getJettyRequestLogFile() {
        return jettyRequestLogFile;
    }

    protected static void clearJettyRequestLogFile() {
        try {
            Files.write(Path.of(getJettyRequestLogFile()), new byte[0], StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    protected static List<String> readJettyRequestLogFile() {
        try {
            Uninterruptibles.sleepUninterruptibly(1L, TimeUnit.SECONDS);    // wait for fsync
            return Files.readAllLines(Path.of(getJettyRequestLogFile()));
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    public static String getResource(final String resourceName) {
        try {
            return Resources.toString(Resources.getResource(resourceName), Charsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    public static <T> T getResource(final String resourceName, final Class<T> className) {
        try {
            return new ObjectMapper().readValue(getResource(resourceName), className);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    // HTTP requests

    public <T> ResponseEntity<T> get(final String path, final Class<T> type) {
        return get(path, type, validOAuth2Client());
    }

    public <T> ResponseEntity<T> get(final String path, final Class<T> type, final HttpEntity httpEntity) {
        return restTemplate.exchange("http://localhost:" + getLocalServerPort() + path, HttpMethod.GET, httpEntity, type);
    }

    public <T> ResponseEntity<T> post(final String path, final Class<T> type, final HttpEntity httpEntity) {
        return restTemplate.exchange("http://localhost:" + getLocalServerPort() + path, HttpMethod.POST, httpEntity, type);
    }

    public <T> ResponseEntity<T> delete(final String path, final Class<T> type, final HttpEntity httpEntity) {
        return restTemplate.exchange("http://localhost:" + getLocalServerPort() + path, HttpMethod.DELETE, httpEntity, type);
    }

    public HttpEntity<Void> validOAuth2Client() {
        String sessionCookie = performFullLoginAndGetSessionCookie("authorised");
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add(HttpHeaders.COOKIE, sessionCookie);
        return new HttpEntity<>(null, requestHeaders);
    }

    public HttpEntity<Void> invalidOAuth2Client() {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add(HttpHeaders.COOKIE, OidcUtils.OIDC_LOCAL_COOKIE_NAME + "=invalid-session-value");
        return new HttpEntity<>(null, requestHeaders);
    }

    protected String extractXsrfCookie() {

        final ResponseEntity<String> csrfResponse = get("/db-web-ui/api/csrf", String.class, null);

        return csrfResponse.getHeaders()
                .getOrEmpty(HttpHeaders.SET_COOKIE)
                .stream()
                .filter(cookie -> cookie.startsWith(OidcUtils.OIDC_CSRF_COOKIE_NAME + "="))
                .map(cookie -> {
                    final int end = cookie.indexOf(';');
                    return cookie.substring(
                            OidcUtils.OIDC_CSRF_COOKIE_NAME.length() + 1,
                            end >= 0 ? end : cookie.length()
                    );
                })
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Cookie XSRF-TOKEN not found in response"));
    }

    protected String performFullLoginAndGetSessionCookie(final String authorizationCode) {
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
                .queryParam("code", authorizationCode)
                .queryParam("state", state)
                .build()
                .toUri();

        final ResponseEntity<String> callback = restTemplate.exchange(
                callbackUri, HttpMethod.GET, new HttpEntity<>(null, callbackHeaders), String.class);

        final List<String> callbackSetCookie = callback.getHeaders().get(HttpHeaders.SET_COOKIE);
        return callbackSetCookie.stream()
                .filter(header -> header.startsWith(OidcUtils.OIDC_LOCAL_COOKIE_NAME + "="))
                .findFirst()
                .map(header -> header.split(";", 2)[0])
                .orElse(sessionCookie);

    }


    protected String extractSessionId(final String sessionCookie) {
        final String rawValue = sessionCookie.substring(OidcUtils.OIDC_LOCAL_COOKIE_NAME.length() + 1);
        return new String(java.util.Base64.getDecoder().decode(rawValue), java.nio.charset.StandardCharsets.UTF_8);
    }

    protected String extractQueryParam(final String url, final String name) {
        final String raw = UriComponentsBuilder.fromUriString(url).build().getQueryParams().getFirst(name);
        if (raw == null) {
            return null;
        }
        return java.net.URLDecoder.decode(raw, java.nio.charset.StandardCharsets.UTF_8);
    }

    protected String extractSessionCookie(final ResponseEntity<?> response) {
        final List<String> setCookieHeaders = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        if (setCookieHeaders == null) {
            throw new IllegalStateException("No Set-Cookie header present in response");
        }
        return setCookieHeaders.stream()
                .filter(header -> header.startsWith(net.ripe.whois.config.OidcUtils.OIDC_LOCAL_COOKIE_NAME + "="))
                .findFirst()
                .map(header -> header.split(";", 2)[0])
                .orElseThrow(() -> new IllegalStateException(
                        "No session cookie found in Set-Cookie headers: " + setCookieHeaders));
    }
}
