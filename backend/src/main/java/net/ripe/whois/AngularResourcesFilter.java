package net.ripe.whois;

import org.springframework.stereotype.Component;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class AngularResourcesFilter implements Filter {

    private static final String REDIRECT_PATH = "/index.html";

    @Override
    public void doFilter(final ServletRequest req, final ServletResponse res, final FilterChain chain) throws IOException, ServletException {

        final HttpServletResponse response = (HttpServletResponse) res;
        final HttpServletRequest request = (HttpServletRequest) req;

        final String uri = request.getRequestURI().substring(request.getContextPath().length());

        if (isAngularPath(uri)) {
            chain.doFilter(
                new HttpServletRequestWrapper(request) {
                    @Override
                    public String getServletPath() {
                        return REDIRECT_PATH;
                    }

                    @Override
                    public String getRequestURI() {
                        return REDIRECT_PATH;
                    }
                },
                response);
        } else {
            chain.doFilter(req, res);
        }
    }

    private boolean isAngularPath(final String uri) {
        return uri.startsWith("/webupdates") ||
                uri.startsWith("/query") ||
                uri.startsWith("/fulltextsearch") ||
                uri.startsWith("/syncupdates") ||
                uri.startsWith("/myresources") ||
                uri.startsWith("/lookup") ||
                uri.startsWith("/textupdates") ||
                uri.startsWith("/fmp") ||
                uri.startsWith("/forceDelete") ||
                uri.startsWith("/error") ||
                uri.startsWith("/not-found");
    }
}
