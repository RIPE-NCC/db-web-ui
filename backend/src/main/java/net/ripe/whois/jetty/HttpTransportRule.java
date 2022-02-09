package net.ripe.whois.jetty;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.http.HttpScheme;
import org.eclipse.jetty.rewrite.handler.Rule;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class HttpTransportRule extends Rule {
    private final HttpScheme transport;
    private final Rule delegate;

    public HttpTransportRule(final HttpScheme transport, final Rule delegate) {
        this.transport = transport;
        this.delegate = delegate;
    }

    @Override
    public String matchAndApply(String target, HttpServletRequest request, HttpServletResponse response) throws IOException {
        return hasTransport(request)? delegate.matchAndApply(target, request, response) : null;
    }

    private boolean hasTransport(final HttpServletRequest request) {
        final String header = request.getHeader(HttpHeader.X_FORWARDED_PROTO.toString());
        return  StringUtils.isEmpty(header) ? false : transport.is(header);
    }

    @Override
    public boolean isTerminating() {
        return delegate.isTerminating();
    }

    @Override
    public boolean isHandling() {
        return delegate.isHandling();
    }
}
