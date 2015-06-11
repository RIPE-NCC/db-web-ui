package net.ripe.whois;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CrowdInterceptor implements Filter {
    public static final String CROWD_TOKEN_KEY = "crowd.token_key";

    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        if (request.getCookies() != null) {
            for (Cookie c : request.getCookies()) {
                if (CROWD_TOKEN_KEY.equals(c.getName())) {
                    chain.doFilter(req, res);
                    return;
                }
            }
        }

        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
    }

    public void init(FilterConfig filterConfig) {
    }

    public void destroy() {
    }
}
