package net.ripe.whois;

import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import javax.servlet.FilterChain;
import javax.servlet.http.Cookie;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

public class CrowdInterceptorTest {
    public static final String CROWD_TOKEN = "SOME_CROWD_TOKEN";

    private FilterChain filterChain;

    private MockHttpServletResponse response;
    private MockHttpServletRequest request;

    private CrowdInterceptor crowdInterceptor;

    @Before
    public void setup() {
        filterChain = mock(FilterChain.class);

        response = new MockHttpServletResponse();
        request = new MockHttpServletRequest();

        crowdInterceptor = new CrowdInterceptor();
    }

    @Test
    public void itShouldProceedWithDoFilter() throws Exception {
        request.setCookies(new Cookie(CrowdInterceptor.CROWD_TOKEN_KEY, CROWD_TOKEN));

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void itShouldGive401IfCookieIsNotPresent() throws Exception {
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
    }
}
