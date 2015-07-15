package net.ripe.whois;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

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
public class CrowdInterceptor implements Filter {

    public static final String CROWD_TOKEN_KEY = "crowd.token_key";

    private final String crowdLoginUrl;

    @Autowired
    public CrowdInterceptor(@Value("${crowd.login.url}") final String crowdLoginUrl) {
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

        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }

    @Override
    public void init(final FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
