package net.ripe.whois.web.api.user;

import net.ripe.whois.config.OidcUtils;
import net.ripe.whois.services.SessionEmitterService;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Optional;

@RestController
@RequestMapping("/api/session")
public class SessionEventsController {

    private final SessionEmitterService sessionEmitterService;

    public SessionEventsController(final SessionEmitterService sessionEmitterService) {
        this.sessionEmitterService = sessionEmitterService;
    }

    @GetMapping(path = "/events", produces = "text/event-stream")
    public SseEmitter subscribe(@CookieValue(name = OidcUtils.OIDC_LOCAL_COOKIE_NAME, required = false) String sessionCookie) {
        final Optional<String> sessionId = OidcUtils.decodeSessionId(sessionCookie);
        if (sessionId.isEmpty() || !sessionEmitterService.hasValidOidcSession(sessionId.get())) { //there is no session to subscribe to
            return sessionEmitterService.immediatelyExpired();
        }
        return sessionEmitterService.subscribe(sessionId.get());
    }

}
