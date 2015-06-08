package net.ripe.whois;

import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import net.ripe.whois.web.api.user.UserController;
import org.joda.time.LocalDateTime;

import javax.servlet.*;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class CrowdInterceptor implements Filter {
    public static final String CROWD_TOKEN_KEY = "crowd.token_key";
    private final CrowdClient crowdClient;

    private Map<String, UserSession> sessionMap = new HashMap<>();

    public CrowdInterceptor(CrowdClient crowdClient) {
        this.crowdClient = crowdClient;
    }

    public void doFilter(ServletRequest req, ServletResponse res,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        try {
            UserSession user = getUserSession(request);
            UserController.setUserSession(request, user);
            chain.doFilter(req, res);
        } catch (CrowdClientException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    private UserSession getUserSession(HttpServletRequest request) {
        String cookie = getCookie(request);
        if(sessionMap.containsKey(cookie)) {
            return getUserSessionFromCache(request, cookie);
        } else {
            UserSession userSession = crowdClient.getUserSession(cookie);
            sessionMap.put(cookie, userSession);
            return userSession;
        }
    }

    private UserSession getUserSessionFromCache(HttpServletRequest request, String cookie) {
        UserSession userSession = sessionMap.get(cookie);
        if(hasExpired(userSession)) {
            sessionMap.remove(cookie);
            return getUserSession(request);
        }
        return userSession;
    }

    private boolean hasExpired(UserSession userSession) {
        return userSession.getExpiryDate().isBefore(LocalDateTime.now());
    }

    public void init(FilterConfig filterConfig) {
    }

    public void destroy() {
    }

    private String getCookie(HttpServletRequest request) {
        if(request.getCookies() != null)
            for(Cookie c: request.getCookies()){
                if(CROWD_TOKEN_KEY.equals(c.getName())){
                    return c.getValue();
                }
            }

        return "";
    }
}
