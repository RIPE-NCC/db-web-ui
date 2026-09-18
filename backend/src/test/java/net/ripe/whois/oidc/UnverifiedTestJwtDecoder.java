package net.ripe.whois.oidc;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

import java.util.Map;

public class UnverifiedTestJwtDecoder implements JwtDecoder {

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            var claims = com.nimbusds.jwt.JWTParser.parse(token).getJWTClaimsSet();
            Map<String, Object> claimsMap = claims.getClaims();

            return Jwt.withTokenValue(token)
                    .headers(h -> h.put("alg", "none"))
                    .claims(c -> c.putAll(claimsMap))
                    .issuedAt(claims.getIssueTime().toInstant())
                    .expiresAt(claims.getExpirationTime().toInstant())
                    .build();
        } catch (Exception e) {
            throw new JwtException("Failed to parse test JWT", e);
        }
    }
}
