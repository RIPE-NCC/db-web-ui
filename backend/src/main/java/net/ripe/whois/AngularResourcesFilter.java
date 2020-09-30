package net.ripe.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

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

    private static final Logger LOGGER = LoggerFactory.getLogger(AngularResourcesFilter.class);

    private static final String REDIRECT_PATH = "/index.html";

    @Override
    public void doFilter(final ServletRequest req, final ServletResponse res, final FilterChain chain) throws IOException, ServletException {

        final HttpServletResponse response = (HttpServletResponse) res;
        final HttpServletRequest request = (HttpServletRequest) req;

        final String uri = request.getRequestURI().substring(request.getContextPath().length());

        // requestURI=/db-web-ui/query uri=/query Angular path? true ****************************
        LOGGER.info(
            "\n\turi={}" +
            "\n\tisAngularPath? {}" +
            "\n\trequestURI={}" +
            "\n\tservlet path={}" +
            "\n\tpath info={}" +
            "\n\tpath translated={}" +
            "\n\tcontext path={}" +
            "\n\trequestURL={}" +
            "\n\tservlet path={}",
            uri,
            isAngularPath(uri),
            request.getRequestURI(),
            request.getServletPath(),
            request.getPathInfo(),
            request.getPathTranslated(),
            request.getContextPath(),
            request.getRequestURL(),
            request.getServletPath());

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

                    @Override
                    public StringBuffer getRequestURL() {
                        return new StringBuffer(REDIRECT_PATH);
                    }

                    @Override
                    public Object getAttribute(final String name) {
                        if (WebUtils.INCLUDE_SERVLET_PATH_ATTRIBUTE.equals(name)) {
                            LOGGER.info("getAttribute: {}={}", name, REDIRECT_PATH);
                            return REDIRECT_PATH;
                        }

                        LOGGER.info("getAttribute: {}={}", name, super.getAttribute(name));
                        return super.getAttribute(name);
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
