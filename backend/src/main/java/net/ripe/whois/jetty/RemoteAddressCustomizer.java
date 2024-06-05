package net.ripe.whois.jetty;

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import org.eclipse.jetty.http.HttpField;
import org.eclipse.jetty.http.HttpFields;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.Request;

/**
 * X-Forwarded-For address will replace the request address.
 * In case of multiple (comma separated) ip address in X-Forwarded-For, rightmost will replace the request address.
 */
public class RemoteAddressCustomizer implements HttpConfiguration.Customizer {

    private static final Splitter COMMA_SPLITTER = Splitter.on(',').omitEmptyStrings().trimResults();

    @Override
    public Request customize(final Request request, final HttpFields.Mutable responseHeaders) {
        return new RemoteAddressRequest(request);
    }

    // TODO: override remote address similar to ProxyCustomizer

    private static class RemoteAddressRequest extends Request.Wrapper {

        final String remoteAddress;
        final String scheme;

        public RemoteAddressRequest(Request wrapped) {
            super(wrapped);
            this.remoteAddress = parseRemoteAddress(wrapped);
            this.scheme = parseScheme(wrapped);
        }

        private String parseRemoteAddress(final Request request) {
            // request.setRemoteAddr(InetSocketAddress.createUnresolved(getRemoteAddress(request), request.getRemotePort()));
            String header = getLastValidHeader(request, HttpHeader.X_FORWARDED_FOR);
            if (Strings.isNullOrEmpty(header)) {
                return Request.getRemoteAddr(request);
            } else {
                return header;
            }
        }

        private String parseScheme(final Request request) {
            final String header = getLastValidHeader(request, HttpHeader.X_FORWARDED_PROTO);
            if (Strings.isNullOrEmpty(header)) {
                return request.getHttpURI().getScheme();
            }
            return header;
        }

        private String getLastValidHeader(final Request request, final HttpHeader headerName) {
            final HttpField lastField = request.getHeaders().stream()
                .filter(httpField -> httpField.getHeader().equals(headerName))
                .reduce((first, second) -> second)
                .orElse(null);

            if (lastField != null) {
                return Iterables.getLast(COMMA_SPLITTER.split(lastField.getValue()));
            } else {
                return "";
            }
        }
    }
}
