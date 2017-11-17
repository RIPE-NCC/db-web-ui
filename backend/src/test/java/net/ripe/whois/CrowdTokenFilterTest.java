package net.ripe.whois;

import net.ripe.whois.services.crowd.CachingCrowdSessionChecker;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ContextConfiguration;

import javax.servlet.FilterChain;
import javax.servlet.http.Cookie;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
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

    @Before
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

        verify(crowdSessionChecker, never()).isAuthenticated(anyString());

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit"));
    }

    @Test
    public void response_302_if_expired_crowd_cookie_present() throws Exception {
        request.setCookies(new Cookie(CrowdTokenFilter.CROWD_TOKEN_KEY, "value"));

        when(crowdSessionChecker.isAuthenticated("value")).thenReturn(false);

        crowdInterceptor.doFilter(request, response, filterChain);

        assertThat(response.getStatus(), is(302));
        assertThat(response.getHeader("Location"), is("https://access.url?originalUrl=http://localhost/doit"));
    }

    @Test
    public void proceed_if_valid_crowd_cookie_present() throws Exception {
        request.setCookies(new Cookie(CrowdTokenFilter.CROWD_TOKEN_KEY, "value"));

        when(crowdSessionChecker.isAuthenticated("value")).thenReturn(true);

        crowdInterceptor.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    @Ignore
    public void no_call_to_crowd_for_second_lookup() throws Exception {
        request.setCookies(new Cookie(CrowdTokenFilter.CROWD_TOKEN_KEY, "value"));

        when(crowdSessionChecker.isAuthenticated("value")).thenReturn(true);

        for (int i = 0; i < 10; i++) {
            crowdInterceptor.doFilter(request, response, filterChain);
        }

        verify(filterChain, times(10)).doFilter(request, response);
        // TODO: Mokito reports this one to be called 10 times
        verify(crowdSessionChecker, times(1)).isAuthenticated("value");
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
        request = new MockHttpServletRequest("GET", "/db-web-ui/scripts/updates/web/select.html");
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

}
