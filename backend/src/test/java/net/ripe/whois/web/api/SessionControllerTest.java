package net.ripe.whois.web.api;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SessionControllerTest {

    private final SessionController controller = new SessionController();

    @Test
    void shouldReturnUnauthenticatedWhenAuthenticationIsNull() {
        HttpSession session = mock(HttpSession.class);

        SessionInfo result = controller.session(session, null);

        assertFalse(result.authenticated());
        assertNull(result.expiresAt());
    }

    @Test
    void shouldReturnUnauthenticatedWhenAuthenticationIsNotAuthenticated() {
        HttpSession session = mock(HttpSession.class);

        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(false);

        SessionInfo result = controller.session(session, authentication);

        assertFalse(result.authenticated());
        assertNull(result.expiresAt());
    }

    @Test
    void shouldReturnExpirationTimeWhenAuthenticated() {
        HttpSession session = mock(HttpSession.class);

        long lastAccessed = 1_700_000_000_000L;
        int maxInactiveInterval = 8 * 60 * 60;

        when(session.getLastAccessedTime()).thenReturn(lastAccessed);
        when(session.getMaxInactiveInterval()).thenReturn(maxInactiveInterval);

        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);

        SessionInfo result = controller.session(session, authentication);

        assertTrue(result.authenticated());

        Instant expected = Instant.ofEpochMilli(
            lastAccessed + maxInactiveInterval * 1000L
        );

        assertEquals(expected, result.expiresAt());
    }
}
