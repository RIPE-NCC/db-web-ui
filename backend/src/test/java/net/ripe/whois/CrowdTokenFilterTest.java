package net.ripe.whois;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.crowd.CachingCrowdSessionChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ContextConfiguration;

import javax.servlet.FilterChain;
import javax.servlet.http.Cookie;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ContextConfiguration(classes = {CrowdTokenFilterTest.TestConfiguration.class})
public class CrowdTokenFilterTest {

    @Mock
    private FilterChain filterChain;

    @Mock
    private CachingCrowdSessionChecker crowdSessionChecker;

    private MockHttpServletResponse response;
    private MockHttpServletRequest request;

    private CrowdTokenFilter crowdInterceptor;

    @Configuration
    @EnableCaching
    @ComponentScan(basePackages = "net.ripe.whois")
    public static class TestConfiguration {

        @Bean
        public CacheManager cacheManager() {
            return new EhCacheCacheManager(ehCacheCacheManager().getObject());
        }

        @Bean
        public EhCacheManagerFactoryBean ehCacheCacheManager() {
            EhCacheManagerFactoryBean cmfb = new EhCacheManagerFactoryBean();
            cmfb.setConfigLocation(new ClassPathResource("ehcache.xml"));
            cmfb.setShared(true);
            return cmfb;
        }
    }

    @BeforeEach
    public void setup() {
        filterChain = mock(FilterChain.class);

        response = new MockHttpServletResponse();
        request = new MockHttpServletRequest("GET", "/doit");

        crowdInterceptor = new CrowdTokenFilter("https://access.url", crowdSessionChecker);
    }

    @Test
    public void response_302_if_no_crowd_cookie_present() throws Exception {
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(crowdSessionChecker, never()).hasActiveToken(anyString(), anyString());

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit"));
    }

    @Test
    public void response_302_if_expired_crowd_cookie_present() throws Exception {
        request.setCookies(new Cookie(CrowdTokenFilter.CROWD_TOKEN_KEY, "value"));

        when(crowdSessionChecker.hasActiveToken(eq("value"), anyString())).thenReturn(false);

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit"));
    }

    @Test
    public void proceed_if_valid_crowd_cookie_present() throws Exception {
        request.setCookies(new Cookie(CrowdTokenFilter.CROWD_TOKEN_KEY, "value"));

        when(crowdSessionChecker.hasActiveToken(eq("value"), anyString())).thenReturn(true);

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_css_resources() throws Exception {
        request = new MockHttpServletRequest("GET", "/static.css");
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertThat(response.getStatus(), is(200));
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
    public void proceed_for_unprotected_base_url() throws Exception {
        request.setCookies();

        request = new MockHttpServletRequest("GET", "/db-web-ui/index.html");

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void proceed_for_unprotected_select_url() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/ng/updates/web/select.component.html");
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void respond_with_302_for_protected_resource() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/#/webupdates/modify/RIPE/mntner/test-mnt");
        request.setCookies();

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/db-web-ui/%23/webupdates/modify/RIPE/mntner/test-mnt"));
    }

    @Test
    public void respond_with_401_found_for_protected_resource_with_ajax() throws Exception {

        request = new MockHttpServletRequest("GET", "/db-web-ui/#/webupdates/modify/RIPE/mntner/test-mnt");
        request.setCookies();
        request.addHeader("X-Requested-With", "XMLHttpRequest");

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(401));
    }

    @Test
    public void original_url_query_param_is_encoded_properly() throws Exception {
        request.setCookies();

        request.setQueryString("param=test");

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit?param%3Dtest"));
    }

    @Test
    public void respond_with_error_when_already_called_redirected_once_to_access_page() throws Exception {
        request = new MockHttpServletRequest("GET", "/db-web-ui/webupdates/create/RIPE/role/self");
        request.setCookies(new Cookie(CrowdTokenFilter.CROWD_TOKEN_KEY, "value"));

        when(crowdSessionChecker.hasActiveToken(eq("value"), anyString())).thenThrow(new RestClientException(HttpStatus.SERVICE_UNAVAILABLE.value(), ""));

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("http://localhost/error"));
    }
}
