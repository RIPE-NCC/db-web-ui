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
public class CrowdTokenFilterTest {

    @Mock
    private FilterChain filterChain;

    private MockHttpServletResponse response;
    private MockHttpServletRequest request;

    private CrowdTokenFilter crowdInterceptor;

    @Before
    public void setup() {
        filterChain = mock(FilterChain.class);

        response = new MockHttpServletResponse();
        request = new MockHttpServletRequest("GET", "/doit");

        crowdInterceptor = new CrowdTokenFilter("https://access.url");
    }

    @Test
    public void proceed_if_crowd_cookie_present() throws Exception {
        request.setCookies(new Cookie(CrowdTokenFilter.CROWD_TOKEN_KEY, "value"));

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void response_302_found_if_no_crowd_cookie_present() throws Exception {
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit"));
    }

    @Test
    public void proceed_for_css_resources() throws Exception {
        request = new MockHttpServletRequest("GET", "/static.css");

        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_javascript_resources() throws Exception {
        request = new MockHttpServletRequest("GET", "/static.js");

        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }


    @Test
    public void proceed_for_image_resources() throws Exception {
        request = new MockHttpServletRequest("GET", "/static.png");

        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_unprotected_select_url() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/#/webupdates/select");

        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_unprotected_display_url() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/#/webupdates/display/RIPE/mntner/test-mnt");

        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void response_302_found_if_modify_url() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/#/webupdates/modify/RIPE/mntner/test-mnt");

        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/db-web-ui/%23/webupdates/modify/RIPE/mntner/test-mnt"));
    }

    @Test
    public void original_url_query_param_is_encoded_properly() throws Exception {
        request.setCookies();
        request.setQueryString("param=test");

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit?param%3Dtest"));
    }
}
