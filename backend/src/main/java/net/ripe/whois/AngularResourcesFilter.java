package net.ripe.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;

@Component
public class AngularResourcesFilter implements Filter {

    private static final Logger LOGGER = LoggerFactory.getLogger(AngularResourcesFilter.class);
    private static final String REDIRECT_PATH = "/index.html";

    @Override
    public void doFilter(final ServletRequest req, final ServletResponse res, final FilterChain chain){
        final HttpServletResponse response = (HttpServletResponse) res;
        final HttpServletRequest request = (HttpServletRequest) req;

        final String uri = request.getRequestURI().substring(request.getContextPath().length());
        LOGGER.info("AngularResourcesFilter uri: {} addr:{}", uri, req.getRemoteAddr());
        try {
            if (isAngularPath(uri)) {
                chain.doFilter(
                        new HttpServletRequestWrapper(request) {
                            @Override
                            public String getServletPath() {
                                return request.getContextPath() + REDIRECT_PATH;
                            }

                            @Override
                            public String getRequestURI() {
                                return request.getContextPath() + REDIRECT_PATH;
                            }
                        },
                        response);
            } else {
                chain.doFilter(req, res);
            }
        } catch (final Exception ex){
            LOGGER.error(ex.getClass().getName(), ex);
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
                uri.startsWith("/not-found") ||
                uri.startsWith("/legal");
    }
}
