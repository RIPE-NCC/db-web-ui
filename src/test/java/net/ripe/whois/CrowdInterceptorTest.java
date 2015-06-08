package net.ripe.whois;


import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import net.ripe.whois.web.api.user.UserController;
import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import javax.servlet.FilterChain;
import javax.servlet.http.Cookie;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.mockito.Mockito.*;

public class CrowdInterceptorTest {
    public static final String CROWD_TOKEN = "SOME_CROWD_TOKEN";


    /*
     HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        try {
            UserSession user = crowdClient.getUserSession(getCookie(request));
            UserController.setUserSession(request, user);
            chain.doFilter(req, res);
        } catch (CrowdClientException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }
     */

    private CrowdClient crowdClient;
    private FilterChain filterChain;

    private MockHttpServletResponse response;
    private MockHttpServletRequest request;

    private CrowdInterceptor crowdInterceptor;
    private UserSession userSession = new UserSession("someone@ripe.net", true, null);

    @Before
    public void setup() {

        crowdClient = mock(CrowdClient.class);
        filterChain = mock(FilterChain.class);

        response = new MockHttpServletResponse();
        request = new MockHttpServletRequest();

        crowdInterceptor = new CrowdInterceptor(crowdClient);

        request.setCookies(new Cookie(CrowdInterceptor.CROWD_TOKEN_KEY, CROWD_TOKEN));
    }

    @Test
    public void itShouldStoreTheUserSessionInTheRequest() throws Exception {
        when(crowdClient.getUserSession(CROWD_TOKEN)).thenReturn(userSession);

        crowdInterceptor.doFilter(request, response, filterChain);

        assertSame(userSession, request.getAttribute(UserController.REQUEST_USER));

    }

    @Test
    public void itShouldProceedWithDoFilter() throws Exception {
        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void itShouldGive401OnCrowExceptions() throws Exception {
        when(crowdClient.getUserSession(CROWD_TOKEN)).thenThrow(new CrowdClientException(""));

        crowdInterceptor.doFilter(request, response, filterChain);

        assertEquals(401, response.getStatus());
    }

    @Test
    public void itShouldNotProceedWithTheChainOnCrowExceptions() throws Exception {
        when(crowdClient.getUserSession(CROWD_TOKEN)).thenThrow(new CrowdClientException(""));

        crowdInterceptor.doFilter(request, response, filterChain);

        verifyZeroInteractions(filterChain);
    }

    @Test
    public void itShouldUseEmptyStringIfCookieIsNotPresent() throws Exception {
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(crowdClient).getUserSession("");
    }


}
