package net.ripe.whois;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.CachingSessionChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SsoTokenFilterTest {

    @Mock
    private FilterChain filterChain;

    @Mock
    private CachingSessionChecker sessionChecker;

    private MockHttpServletResponse response;
    private MockHttpServletRequest request;

    private SsoTokenFilter ssoInterceptor;

    @BeforeEach
    public void setup() {
        filterChain = mock(FilterChain.class);

        response = new MockHttpServletResponse();
        request = new MockHttpServletRequest("GET", "/doit");

        ssoInterceptor = new SsoTokenFilter("https://access.url", sessionChecker);
    }

    @Test
    public void response_302_if_no_sso_cookie_present() throws Exception {
        request.setCookies();

        ssoInterceptor.doFilter(request, response, filterChain);

        verify(sessionChecker, never()).hasActiveToken(anyString(), anyString());

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit"));
    }

    @Test
    public void response_302_if_expired_sso_cookie_present() throws Exception {
        request.setCookies(new Cookie(SsoTokenFilter.SSO_TOKEN_KEY, "value"));

        when(sessionChecker.hasActiveToken(eq("value"), anyString())).thenReturn(false);

        ssoInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit"));
    }

    @Test
    public void proceed_if_valid_sso_cookie_present() throws Exception {
        request.setCookies(new Cookie(SsoTokenFilter.SSO_TOKEN_KEY, "value"));

        when(sessionChecker.hasActiveToken(eq("value"), anyString())).thenReturn(true);

        ssoInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_css_resources() throws Exception {
        request = new MockHttpServletRequest("GET", "/static.css");
        request.setCookies();

        ssoInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(response.getStatus(), is(200));
    }

    @Test
    public void proceed_for_javascript_resources() throws Exception {
        request = new MockHttpServletRequest("GET", "/static.js");
        request.setCookies();

        ssoInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_image_resources() throws Exception {
        request = new MockHttpServletRequest("GET", "/static.png");
        request.setCookies();

        ssoInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_unprotected_base_url() throws Exception {
        request.setCookies();

        request = new MockHttpServletRequest("GET", "/db-web-ui/index.html");

        ssoInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_unprotected_select_url() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/ng/updates/web/select.component.html");
        request.setCookies();

        ssoInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void respond_with_302_for_protected_resource() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/#/webupdates/modify/RIPE/mntner/test-mnt");
        request.setCookies();

        ssoInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/db-web-ui/%23/webupdates/modify/RIPE/mntner/test-mnt"));
    }

    @Test
    public void respond_with_401_found_for_protected_resource_with_ajax() throws Exception {

        request = new MockHttpServletRequest("GET", "/db-web-ui/#/webupdates/modify/RIPE/mntner/test-mnt");
        request.setCookies();
        request.addHeader("X-Requested-With", "XMLHttpRequest");

        ssoInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(401));
    }

    @Test
    public void original_url_query_param_is_encoded_properly() throws Exception {
        request.setCookies();

        request.setQueryString("param=test");

        ssoInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit?param%3Dtest"));
    }

    @Test
    public void respond_with_error_when_already_called_redirected_once_to_access_page() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/webupdates/create/RIPE/role/self");
        request.setCookies(new Cookie(SsoTokenFilter.SSO_TOKEN_KEY, "value"));

        when(sessionChecker.hasActiveToken(eq("value"), anyString())).thenThrow(new RestClientException(HttpStatus.SERVICE_UNAVAILABLE.value(), ""));

        ssoInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("http://localhost/error"));
    }
}
