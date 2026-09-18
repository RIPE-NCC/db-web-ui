package net.ripe.whois.oidc;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

public class TestJwtSupport {

    private static final RSAKey RSA_KEY = generateKey();

    private static RSAKey generateKey() {
        try {
            return new RSAKeyGenerator(2048)
                    .keyID("test-key-1")
                    .generate();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /** JSON Web Key Set containing only the PUBLIC key — served at the test JWKS endpoint. */
    public static String jwksJson() {
        return new JWKSet(RSA_KEY.toPublicJWK()).toString();
    }

    public static String logoutToken(String issuer, String subject, String sid) {
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer(issuer)
                    .subject(subject)
                    .audience("test-client")
                    .claim("sid", sid)
                    .claim("events", Map.of("http://schemas.openid.net/event/backchannel-logout", Map.of()))
                    .issueTime(Date.from(Instant.now()))
                    .expirationTime(Date.from(Instant.now().plusSeconds(60)))
                    .jwtID(UUID.randomUUID().toString())
                    .build();

            SignedJWT jwt = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256).keyID("test-key-1").build(),
                    claims);
            jwt.sign(new RSASSASigner(RSA_KEY)); // signs with the PRIVATE key, held only here
            return jwt.serialize();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
