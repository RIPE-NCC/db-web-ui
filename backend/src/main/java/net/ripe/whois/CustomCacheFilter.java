package net.ripe.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
@Primary
public class CustomCacheFilter implements Filter {
    private static final Logger LOGGER = LoggerFactory.getLogger(CustomCacheFilter.class);

    private final long MAX_AGE_IN_SECONDS = TimeUnit.SECONDS.convert(365, TimeUnit.DAYS);

    private static final String[] CACHEABLE = {
        ".js",
        ".css",
        ".ico",
        ".jpg",
        ".png",
        ".gif"
    };

    @Override
    public void doFilter(final ServletRequest req, final ServletResponse res, final FilterChain chain) throws IOException, ServletException {

        final HttpServletResponse response = (HttpServletResponse) res;
        final HttpServletRequest request = (HttpServletRequest) req;

        if (isCacheable(request)) {
            LOGGER.debug("Adding cache control to file '{}'", request.getRequestURL());
            response.setHeader("Cache-Control", "public,max-age="+MAX_AGE_IN_SECONDS+",s-maxage="+MAX_AGE_IN_SECONDS);
        } else {
            LOGGER.debug("Not adding cache control to '{}'", request.getRequestURL());
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
        }
        chain.doFilter(req, res);
    }

    private boolean isCacheable(final HttpServletRequest request) {
        final String requestURI = request.getRequestURI();
        for (final String urlPattern : CACHEABLE) {
            if (requestURI.endsWith(urlPattern)) {
                return true;
            }
        }
        return false;
    }


    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }

}
