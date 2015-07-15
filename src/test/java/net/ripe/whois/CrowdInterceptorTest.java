package net.ripe.whois;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import javax.servlet.FilterChain;
import javax.servlet.http.Cookie;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class CrowdInterceptorTest {
    public static final String CROWD_TOKEN = "SOME_CROWD_TOKEN";

    @Mock
    private FilterChain filterChain;

    private MockHttpServletResponse response;
    private MockHttpServletRequest request;

    private CrowdInterceptor crowdInterceptor;

    @Before
    public void setup() {
        filterChain = mock(FilterChain.class);

        response = new MockHttpServletResponse();
        request = new MockHttpServletRequest();

        crowdInterceptor = new CrowdInterceptor("https://access.url");
    }

    @Test
    public void proceed_if_crowd_cookie_present() throws Exception {
        request.setCookies(new Cookie(CrowdInterceptor.CROWD_TOKEN_KEY, CROWD_TOKEN));

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void response_302_found_if_no_crowd_cookie_present() throws Exception {
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost"));
    }

    @Test
    public void original_url_query_param_is_encoded_properly() throws Exception {
        request.setCookies();
        request.setQueryString("param=test");

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost?param%3Dtest"));
    }
}
