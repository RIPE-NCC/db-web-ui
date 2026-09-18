package net.ripe.whois.web.api.user;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.services.SessionEmitterService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/session")
public class SessionEventsController {

    private final SessionEmitterService sessionEmitterService;

    public SessionEventsController(final SessionEmitterService sessionEmitterService) {
        this.sessionEmitterService = sessionEmitterService;
    }

    @GetMapping(path = "/events", produces = "text/event-stream")
    public SseEmitter subscribe(final HttpServletRequest request) {
        final String sessionId = request.getSession(true).getId(); // create if absent, so we always have a key to subscribe under
        if (!sessionEmitterService.hasValidOidcSession(sessionId)) {
            return sessionEmitterService.immediatelyExpired();
        }
        return sessionEmitterService.subscribe(sessionId);
    }

}
