package net.ripe.whois.web.api.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/user-oidc")
public class UserControllerOidc {

    @GetMapping("me")
    public ResponseEntity<Map<String, Object>> me(
            @AuthenticationPrincipal OidcUser user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(Map.of(
                "name", user.getFullName(),
                "email", user.getEmail(),
                "username", user.getPreferredUsername(),
                "photo", user.getClaimAsString("ripe_user_id")
        ));
    }


    @GetMapping("info")
    public boolean user(Principal principal) {
        return principal != null;
    }
}
