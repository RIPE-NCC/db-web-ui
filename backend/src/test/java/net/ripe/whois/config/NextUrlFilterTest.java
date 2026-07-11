package net.ripe.whois.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

class NextUrlFilterTest {

    private final NextUrlFilter filter = new NextUrlFilter();

    private HttpServletRequest request;
    private HttpServletResponse response;
    private HttpSession session;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        session = mock(HttpSession.class);
        filterChain = mock(FilterChain.class);

        when(request.getSession()).thenReturn(session);
    }

    @Test
    void shouldStoreNextUrlInSession() throws Exception {
        when(request.getRequestURI())
            .thenReturn("/db-web-ui/oauth2/authorization/keycloak");
        when(request.getParameter("next"))
            .thenReturn("/query?search=AS3333");

        filter.doFilterInternal(request, response, filterChain);

        verify(session).setAttribute(
            NextUrlFilter.NEXT_URL_SESSION_ATTRIBUTE,
            "/query?search=AS3333");

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldNotStoreNextUrlWhenParameterIsMissing() throws Exception {
        when(request.getRequestURI())
            .thenReturn("/db-web-ui/oauth2/authorization/keycloak");
        when(request.getParameter("next"))
            .thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(session, never())
            .setAttribute(anyString(), any());

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldIgnoreOtherRequestUris() throws Exception {
        when(request.getRequestURI())
            .thenReturn("/api/session");

        filter.doFilterInternal(request, response, filterChain);

        verify(session, never())
            .setAttribute(anyString(), any());

        verify(request, never())
            .getParameter("next");

        verify(filterChain).doFilter(request, response);
    }
}
