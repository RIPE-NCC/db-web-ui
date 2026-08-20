package net.ripe.whois.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * store `next` param in the session and use it later to redirect the user to the proper url
 */
public class NextUrlFilter extends OncePerRequestFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(NextUrlFilter.class);

    public static final String NEXT_URL_SESSION_ATTRIBUTE = "NEXT_URL";

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain)
        throws ServletException, IOException {

        LOGGER.info("NextUrlFilter: {}", request.getRequestURI());
        if (request.getRequestURI().equals("/db-web-ui/oauth2/authorization/keycloak")) {
            String next = request.getParameter("next");
            LOGGER.info("NextUrlFilter: next={}", next);
            if (next != null) {
                request.getSession().setAttribute(NEXT_URL_SESSION_ATTRIBUTE, next);
            }
        }

        filterChain.doFilter(request, response);
    }
}
