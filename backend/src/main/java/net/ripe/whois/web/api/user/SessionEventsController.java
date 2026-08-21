package net.ripe.whois.web.api.user;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.services.SessionExpirationNotifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/session")
public class SessionEventsController {

    private final SessionExpirationNotifier notifier;

    public SessionEventsController(final SessionExpirationNotifier notifier) {
        this.notifier = notifier;
    }

    @GetMapping(path = "/events", produces = "text/event-stream")
    public SseEmitter subscribe(HttpServletRequest request) {
        String sessionId = request.getSession(true).getId(); // create if absent, so we always have a key to subscribe under
        return notifier.subscribe(sessionId);
    }
}
