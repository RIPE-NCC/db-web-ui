package net.ripe.whois.oidc;

import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class KeycloakIdPDummyService {

    public record FakeUser(String subject, String email, String sid) {}

    private final Map<String, FakeUser> usersByCode = new ConcurrentHashMap<>();

    public void registerUser(String authorizationCode, FakeUser user) {
        usersByCode.put(authorizationCode, user);
    }

    private final Set<String> timeoutCodes = ConcurrentHashMap.newKeySet();

    public void registerTimeout(String authorizationCode) {
        timeoutCodes.add(authorizationCode);
    }


    public void clear() {
        usersByCode.clear();
        timeoutCodes.clear();
    }

    public OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> tokenResponseClient() {
        return request -> {
            final String code = getCodeOrTimeOut(request);
            FakeUser user = usersByCode.get(code);
            if (user == null) {
                throw new IllegalStateException("FakeIdp: no user registered for authorization code '" + code + "'");
            }

            // The value actually sent to the IdP as ?nonce=... is the HASH, stored in
            // additionalParameters — not the raw value in attributes. A real IdP just
            // echoes back whatever nonce it received, so we do the same here.
            final String nonceHash = (String) request.getAuthorizationExchange()
                    .getAuthorizationRequest()
                    .getAdditionalParameters()
                    .get(org.springframework.security.oauth2.core.oidc.endpoint.OidcParameterNames.NONCE);

            final Map<String, Object> additionalParams = new HashMap<>();
            additionalParams.put("id_token", buildIdToken(request.getClientRegistration().getClientId(), user, nonceHash));

            return OAuth2AccessTokenResponse.withToken("fake-access-token")
                    .tokenType(OAuth2AccessToken.TokenType.BEARER)
                    .expiresIn(300)
                    .refreshToken("fake-refresh-token")
                    .additionalParameters(additionalParams)
                    .build();
        };
    }

    private String getCodeOrTimeOut(OAuth2AuthorizationCodeGrantRequest request) {
        final String code = request.getAuthorizationExchange().getAuthorizationResponse().getCode();

        if (timeoutCodes.contains(code)) {
            // Mirrors what DefaultAuthorizationCodeTokenResponseClient does internally
            // when the real HTTP call to the token endpoint times out.
            throw new org.springframework.security.oauth2.core.OAuth2AuthorizationException(
                    new org.springframework.security.oauth2.core.OAuth2Error("server_error", "IdP token endpoint timed out", null),
                    new java.net.SocketTimeoutException("Read timed out"));
        }
        return code;
    }

    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        return userRequest -> {
            OidcIdToken idToken = userRequest.getIdToken();
            return new DefaultOidcUser(
                    List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER")),
                    idToken
            );
        };
    }

    private String buildIdToken(String clientId, FakeUser user, String nonce) {
        try {
            var claimsBuilder = new com.nimbusds.jwt.JWTClaimsSet.Builder()
                    .issuer("https://fake-idp.test/realms/test")
                    .subject(user.subject())
                    .audience(clientId)
                    .claim("sid", user.sid())
                    .claim("email", user.email())
                    .claim("preferred_username", user.subject())
                    .issueTime(java.util.Date.from(Instant.now()))
                    .expirationTime(java.util.Date.from(Instant.now().plusSeconds(300)));

            if (nonce != null) {
                // Spring Security compares the HASH of the nonce against the id_token's "nonce" claim
                // when a nonce hash is present in the request; simplest correct approach is to hash it
                // the same way Spring does, OR just pass the raw nonce through if your Spring Security
                // version compares raw values directly. Try raw first — simplest case:
                claimsBuilder.claim("nonce", nonce);
            }

            return new com.nimbusds.jwt.PlainJWT(claimsBuilder.build()).serialize();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
