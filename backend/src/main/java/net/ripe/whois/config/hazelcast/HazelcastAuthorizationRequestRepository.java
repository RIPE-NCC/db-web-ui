package net.ripe.whois.config.hazelcast;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.io.Serializable;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Stores the transient OAuth2AuthorizationRequest (state, nonce, PKCE verifier) in a
 * short-lived cookie instead of HttpSession, so the authorization-code redirect round
 * trip doesn't require sticky routing either.
 */

public class HazelcastAuthorizationRequestRepository implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastAuthorizationRequestRepository.class);

    private static final String BINDING_COOKIE = "oauth2_auth_binding";
    private static final long TTL_SECONDS = 180; // matches the short login-handshake window
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static final String AUTHORIZATION_REQUESTS_MAP = "oauth2-authorization-requests";

    private final IMap<String, Entry> authorizationRequests;

    public HazelcastAuthorizationRequestRepository(HazelcastInstance hazelcastInstance) {
        this.authorizationRequests = hazelcastInstance.getMap(AUTHORIZATION_REQUESTS_MAP);
    }

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        return resolve(request).map(Entry::authorizationRequest).orElse(null);
    }

    public Optional<Entry> loadAuthorizationEntry(HttpServletRequest request) {
        return resolve(request);
    }

    @Override
    public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest,
                                         HttpServletRequest request, HttpServletResponse response) {
        if (authorizationRequest == null) {
            return;
        }

        final String nonce = generateNonce();
        final String nextUrl = request.getParameter("next");
        LOGGER.info("Saving next {}", nextUrl);
        authorizationRequests.put(authorizationRequest.getState(),
                new Entry(authorizationRequest, nonce, nextUrl), TTL_SECONDS, TimeUnit.SECONDS);
        setBindingCookie(response, nonce, request.isSecure(), (int) TTL_SECONDS);
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response) {
        final Optional<OAuth2AuthorizationRequest> result = resolve(request).map(Entry::authorizationRequest);
        String state = request.getParameter("state");

        if (state != null) {
            authorizationRequests.remove(state);
        }
        setBindingCookie(response, "", request.isSecure(), 0);
        return result.orElse(null);
    }

    /** Looks up by state, then requires the binding cookie to match before returning anything. */
    private Optional<Entry> resolve(HttpServletRequest request) {
        String state = request.getParameter("state");
        if (state == null) {
            return Optional.empty();
        }
        Entry entry = authorizationRequests.get(state);
        if (entry == null) {
            return Optional.empty();
        }
        Optional<String> cookieNonce = readBindingCookie(request);
        if (cookieNonce.isEmpty() || !cookieNonce.get().equals(entry.bindingNonce())) {
            return Optional.empty();
        }
        return Optional.of(entry);
    }

    private String generateNonce() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Optional<String> readBindingCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies)
                .filter(c -> BINDING_COOKIE.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    private void setBindingCookie(HttpServletResponse response, String value, boolean secure, int maxAgeSeconds) {
        Cookie cookie = new Cookie(BINDING_COOKIE, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }

    public record Entry(OAuth2AuthorizationRequest authorizationRequest, String bindingNonce, String nextUrl) implements Serializable {
    }

}
