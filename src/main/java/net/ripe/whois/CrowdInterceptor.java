package net.ripe.whois;

import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CrowdInterceptor implements Filter {
    private final CrowdClient crowdClient;

    public CrowdInterceptor(CrowdClient crowdClient) {
        this.crowdClient = crowdClient;
    }

    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        try {
            crowdClient.getUserSession(getCookie(request));
            chain.doFilter(req, res);
        } catch (CrowdClientException e) {
            response.setStatus(403);
        }
    }

    public void init(FilterConfig filterConfig) {
    }

    public void destroy() {
    }

    private String getCookie(HttpServletRequest request) {
        if(request.getCookies() != null)
            for(Cookie c: request.getCookies()){
                if("crowd.token_key".equals(c.getName())){
                    return c.getValue();
                }
            }

        return "";
    }
}
