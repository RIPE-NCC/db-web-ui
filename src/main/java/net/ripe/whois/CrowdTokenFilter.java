package net.ripe.whois;

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
import java.io.UnsupportedEncodingException;

@Component
public class CrowdTokenFilter implements Filter {
    private static final Logger LOGGER = LoggerFactory.getLogger(CrowdTokenFilter.class);

    public static final String CROWD_TOKEN_KEY = "crowd.token_key";
    private static final String[] UNPROTECTED_URLS = {
        ".*/api/.*", /* let rest-operation itself decide about authentication */
        ".*/db-web-ui/",
        ".*/index.html",
        ".*/webupdates/select.html",
        ".*/webupdates/display.html",
        ".*/alertsDirective.html",
        ".*/match-multiple.tpl.html",
        ".*/select-multiple.tpl.html"
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

        if (isStaticResource(request) || isUnprotectedUrl(request) || hasCrowdCookie(request)) {
            LOGGER.debug("Allow {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        LOGGER.info("Block {}", request.getRequestURI());

        reportAuthorisationError(request, response);
    }

    private boolean isStaticResource(HttpServletRequest request) {
        if (request.getRequestURI().endsWith(".css") ||
            request.getRequestURI().endsWith(".js") ||
            request.getRequestURI().endsWith(".png")) {
            return true;
        }
        return false;
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
                    return sessionChecker.isAuthenticated(c.getValue());
                }
            }
        }
        return false;
    }

    private void reportAuthorisationError( final HttpServletRequest request, final HttpServletResponse response ) {
        boolean isAjax = "XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With")) ? true : false;
        if( isAjax ) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
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
        } catch (UnsupportedEncodingException e) {
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
