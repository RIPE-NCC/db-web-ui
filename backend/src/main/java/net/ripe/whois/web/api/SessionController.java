package net.ripe.whois.web.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
public class SessionController {

    @GetMapping("/api/session")
    public SessionInfo session(HttpSession session,
                               Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return new SessionInfo(false, null);
        }

        Instant expiresAt = Instant.ofEpochMilli(
            session.getLastAccessedTime()
                + session.getMaxInactiveInterval() * 1000L
        );

        return new SessionInfo(true, expiresAt);
    }
}
