package net.ripe.whois;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.crowd.CachingCrowdSessionChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriUtils;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class CrowdTokenFilter implements Filter {
    private static final Logger LOGGER = LoggerFactory.getLogger(CrowdTokenFilter.class);

    public static final String CROWD_TOKEN_KEY = "crowd.token_key";
    private static final String[] UNPROTECTED_URLS = {
            ".*/alerts.component.html",
            ".*/actuator/health/readiness",
            ".*/api/.*", /* let rest-operation itself decide about authentication */
            ".*/db-web-ui/",
            // on refresh page to not redirect to login page
            ".*/db-web-ui/webupdates/select",
            ".*/db-web-ui/webupdates/display",
            ".*/db-web-ui/forceDelete",
            ".*/db-web-ui/query",
            ".*/db-web-ui/fulltextsearch",
            ".*/db-web-ui/syncupdates",
            ".*/db-web-ui/lookup",
            ".*/db-web-ui/fmp",
            ".*/db-web-ui/fmp/requireLogin",
            ".*/db-web-ui/error",
            ".*/db-web-ui/not-found",
            ".*/db-web-ui/index.html",
            ".*/db-web-ui/legal",
            // these calls are only made in non-aot mode
            ".*/ng/.*.html",
    };

    private final String crowdLoginUrl;
    private final CachingCrowdSessionChecker sessionChecker;

    @Autowired
    public CrowdTokenFilter(@Value("${crowd.login.url}") final String crowdLoginUrl, final CachingCrowdSessionChecker sessionChecker) {
        this.crowdLoginUrl = crowdLoginUrl;
        this.sessionChecker = sessionChecker;
    }

    @Override
    public void doFilter(
            final ServletRequest servletRequest,
            final ServletResponse servletResponse,
            final FilterChain filterChain)
            throws IOException, ServletException {

        final HttpServletRequest request = (HttpServletRequest) servletRequest;
        final HttpServletResponse response = (HttpServletResponse) servletResponse;

        boolean shouldFilter = true;
        try {
            shouldFilter = isStaticResource(request) || isUnprotectedUrl(request) || hasCrowdCookie(request);
        } catch (RestClientException e) {
            // whoisInternal is not available, we can't redirect to login page as it loops
            response.setHeader(HttpHeaders.LOCATION, generateErrorLocationHeader(request));
            response.setStatus(HttpServletResponse.SC_FOUND);
            return;
        }
        if (shouldFilter) {
            LOGGER.debug("******* Allow {} {}", request.getMethod(), request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        LOGGER.debug("******* Block {} {}", request.getMethod(), request.getRequestURI());

        reportAuthorisationError(request, response);
    }

    private String generateErrorLocationHeader(final HttpServletRequest request) {
        StringBuilder url = new StringBuilder();
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();

        url.append(scheme).append("://").append(serverName);
        if (serverPort != 80 && serverPort != 443) {
            url.append(":").append(serverPort);
        }
        url.append(contextPath).append("/error");
        return url.toString();
    }


    private boolean isStaticResource(HttpServletRequest request) {
        return (request.getRequestURI().endsWith(".css") ||
                request.getRequestURI().endsWith(".js") ||
                request.getRequestURI().endsWith(".json") ||
                request.getRequestURI().endsWith(".js.map") ||
                //request.getRequestURI().endsWith(".html") ||
                request.getRequestURI().endsWith(".woff") ||
                request.getRequestURI().endsWith(".woff2") ||
                request.getRequestURI().endsWith(".png") ||
                request.getRequestURI().endsWith(".gif"));
    }

    private boolean isUnprotectedUrl(HttpServletRequest request) {
        for (final String urlPattern : UNPROTECTED_URLS) {
            if (request.getRequestURI().matches(urlPattern)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasCrowdCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (CROWD_TOKEN_KEY.equals(c.getName())) {
                    return sessionChecker.hasActiveToken(c.getValue());
                }
            }
        }
        return false;
    }

    private void reportAuthorisationError(final HttpServletRequest request, final HttpServletResponse response) {
        boolean isAjax = "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"));
        if (isAjax) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } else {
            response.setHeader(HttpHeaders.LOCATION, generateLocationHeader(request));
            response.setStatus(HttpServletResponse.SC_FOUND);
        }
    }

    private String generateLocationHeader(final HttpServletRequest request) {
        return String.format("%s?originalUrl=%s", crowdLoginUrl, encodeQueryParam(getOriginalUrl(request)));
    }

    private String getOriginalUrl(final HttpServletRequest request) {
        final String queryString = request.getQueryString();
        if (queryString != null) {
            return request.getRequestURL()
                    .append('?')
                    .append(queryString)
                    .toString();
        } else {
            return request.getRequestURL().toString();
        }
    }

    private String encodeQueryParam(final String param) {
        try {
            return UriUtils.encodeQueryParam(param, "UTF-8");
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(e);
        }
    }

    @Override
    public void init(final FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
