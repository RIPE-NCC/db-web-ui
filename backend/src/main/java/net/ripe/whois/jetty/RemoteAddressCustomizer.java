package net.ripe.whois.jetty;

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import org.eclipse.jetty.http.HttpURI;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.util.MultiMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.InetSocketAddress;
import java.util.Enumeration;

import static org.eclipse.jetty.http.HttpHeader.X_FORWARDED_FOR;
import static org.eclipse.jetty.http.HttpHeader.X_FORWARDED_PROTO;

/**
 * X-Forwarded-For address will replace the request address.
 * In case of multiple (comma separated) ip address in X-Forwarded-For, rightmost will replace the request address.
 */
public class RemoteAddressCustomizer implements HttpConfiguration.Customizer {

    private static final Logger LOGGER = LoggerFactory.getLogger(RemoteAddressCustomizer.class);
    private static final Splitter COMMA_SPLITTER = Splitter.on(',').omitEmptyStrings().trimResults();

    @Override
    public void customize(final Connector connector, final HttpConfiguration httpConfiguration, final Request request) {
        setRemoteAddr(request);
        setSecure(request);
        setClientIp(request);
        LOGGER.debug("Received client ip is {}", request.getRemoteAddr());
    }

    private void setRemoteAddr(final Request request) {
        request.setRemoteAddr(InetSocketAddress.createUnresolved(getRemoteAddress(request), request.getRemotePort()));
    }

    private void setSecure(final Request request) {
        request.setHttpURI(
            HttpURI.build(request.getHttpURI())
                .scheme(getScheme(request))
                .asImmutable());
    }

    private void setClientIp(final Request request) {
        if (request.getQueryParameters() == null){
            MultiMap<String> parameters = new MultiMap<>();
            parameters.put("clientIp", request.getRemoteAddr());
            request.setQueryParameters(parameters);
            LOGGER.info("Added clientIp to next request {}", request.getRequestURI());
            return;
        }
        request.getQueryParameters().put("clientIp", request.getRemoteAddr());
    }

    private String getScheme(final Request request) {
        String header = getLastValidHeader(request, X_FORWARDED_PROTO.asString());
        if (Strings.isNullOrEmpty(header)) {
            return request.getScheme();
        }
        return header;
    }

    private String getRemoteAddress(final Request request) {
        String header = getLastValidHeader(request, X_FORWARDED_FOR.asString());
        if (Strings.isNullOrEmpty(header)) {
            return request.getRemoteAddr();
        }
        return header;
    }

    private String getLastValidHeader(final Request request, final String headerName) {
        final Enumeration<String> headers = request.getHeaders(headerName);
        if (headers == null || !headers.hasMoreElements()) {
            return "";
        }

        String header = "";
        while (headers.hasMoreElements()) {
            final String next = headers.nextElement();
            if (!Strings.isNullOrEmpty(next)) {
                header = next;
            }
        }

        return Iterables.getLast(COMMA_SPLITTER.split(header));
    }
}
