package net.ripe.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.io.IOException;

@Component
public class RemoteAddressFilter implements Filter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RemoteAddressFilter.class);
    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain) throws IOException, ServletException {
        if (request instanceof HttpServletRequest) {
            chain.doFilter(new RemoteAddressRequestWrapper((HttpServletRequest) request), response);
        } else {
            chain.doFilter(request, response);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}

    private static final class RemoteAddressRequestWrapper extends HttpServletRequestWrapper {
        private final String remoteAddress;

        private RemoteAddressRequestWrapper(final HttpServletRequest request) {
            super(request);
            this.remoteAddress = getRemoteAddress(request);
        }

        @Override
        public String getRemoteAddr() {
            return remoteAddress;
        }

        private static String getRemoteAddress(final HttpServletRequest request) {
            final String address = request.getRemoteAddr();
            return (address.startsWith("[") && address.endsWith("]")) ? address.substring(1, address.length() - 1) : address;
        }

        @Override
        public String toString() {
            return String.format("RemoteAddressRequestWrapper: %s %s from %s", getMethod(), getRequestURI(), getRemoteAddr());
        }
    }
}
