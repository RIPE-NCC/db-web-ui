package net.ripe.whois.web.api.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import net.ripe.whois.services.SessionCacheService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/session")
public class SessionEventsController {

    private final SessionCacheService sessionCacheService;

    public SessionEventsController(final SessionCacheService sessionCacheService) {
        this.sessionCacheService = sessionCacheService;
    }

    @GetMapping(path = "/events", produces = "text/event-stream")
    public SseEmitter subscribe(final HttpServletRequest request) {
        final String sessionId = request.getSession(true).getId(); // create if absent, so we always have a key to subscribe under
        if (!sessionCacheService.hasValidOidcSession(sessionId)) {
            return sessionCacheService.immediatelyExpired();
        }
        return sessionCacheService.subscribe(sessionId);
    }

    @PostMapping("/invalidate")
    public ResponseEntity<Void> invalidate(final HttpServletRequest request) {
        final HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.ok().build();
        }

        final String sessionId = session.getId();
        sessionCacheService.cleanUpSessionCachesAndEmitters(sessionId, false);

        return ResponseEntity.ok().build();
    }
}
