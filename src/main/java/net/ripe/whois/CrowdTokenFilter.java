package net.ripe.whois;

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

    public static final String CROWD_TOKEN_KEY = "crowd.token_key";

    private final String crowdLoginUrl;

    @Autowired
    public CrowdTokenFilter(@Value("${crowd.login.url}") final String crowdLoginUrl) {
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

        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (CROWD_TOKEN_KEY.equals(c.getName())) {
                    filterChain.doFilter(request, response);
                    return;
                }
            }
        }

        response.setHeader(HttpHeaders.LOCATION, generateLocationHeader(request));
        response.setStatus(HttpServletResponse.SC_FOUND);
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
