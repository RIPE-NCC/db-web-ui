package net.ripe.whois.web.api.user;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user-oidc")
public class UserControllerOidc {

    @GetMapping("me")
    public Map<String, Object> me(
        @AuthenticationPrincipal OidcUser user) {

        return Map.of(
            "name", user.getFullName(),
            "email", user.getEmail(),
            "username", user.getPreferredUsername(),
            "photo", user.getClaimAsString("ripe_user_id")
        );
    }
}
