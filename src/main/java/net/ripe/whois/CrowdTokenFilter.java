package net.ripe.whois;

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
        ".*/#/webupdates/display/.*",
        ".*/#/webupdates/select"
    };

    private final String crowdLoginUrl;

    @Autowired
    public CrowdTokenFilter(@Value("${crowd.login.url}") final String crowdLoginUrl) {
        LOGGER.info("******* Creating crowd filter with config:{}", crowdLoginUrl);
        this.crowdLoginUrl = crowdLoginUrl;
    }

    @Override
    public void doFilter(
        final ServletRequest servletRequest,
        final ServletResponse servletResponse,
        final FilterChain filterChain)
        throws IOException, ServletException {

        final HttpServletRequest request = (HttpServletRequest) servletRequest;
        final HttpServletResponse response = (HttpServletResponse) servletResponse;

        if (isStaticResource(request) || isUnprotectedUrl(request) || hasCrowdCookie(request) ) {
            LOGGER.debug("******* Allow {} {}", request.getMethod(), request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        LOGGER.debug("******* Block {} {}", request.getMethod(), request.getRequestURI());

        response.setHeader(HttpHeaders.LOCATION, generateLocationHeader(request));
        response.setStatus(HttpServletResponse.SC_FOUND);
    }

    private boolean isStaticResource(HttpServletRequest request) {
        if (request.getRequestURI().endsWith(".css") ||
            request.getRequestURI().endsWith(".js") ||
            request.getRequestURI().endsWith(".png")) {
            LOGGER.debug("******* 'static resource:{}", request.getRequestURI());
            return true;
        }
        return false;
    }

    private boolean hasCrowdCookie(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (CROWD_TOKEN_KEY.equals(c.getName())) {
                    LOGGER.debug("******* 'has crowd cookie:{}", request.getRequestURI());
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isUnprotectedUrl(HttpServletRequest request) {
        for (final String urlPattern : UNPROTECTED_URLS) {
            if (request.getRequestURI().matches(urlPattern)){
                LOGGER.debug("******* 'unprotected resource:{}", request.getRequestURI());
                return true;
            }
        }
        return false;
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
        LOGGER.info("******* Init crowd filter with config");
    }

    @Override
    public void destroy() {
        LOGGER.info("******* Destroy crowd filter with config");
    }
}
