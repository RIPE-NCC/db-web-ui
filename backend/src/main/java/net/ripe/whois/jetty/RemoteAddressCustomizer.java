package net.ripe.whois.jetty;

import com.google.common.base.Splitter;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import org.eclipse.jetty.http.HttpFields;
import org.eclipse.jetty.http.HttpScheme;
import org.eclipse.jetty.http.HttpURI;
import org.eclipse.jetty.server.ConnectionMetaData;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.Request;

import javax.annotation.Nullable;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.util.Enumeration;

import static org.eclipse.jetty.http.HttpHeader.X_FORWARDED_FOR;
import static org.eclipse.jetty.http.HttpHeader.X_FORWARDED_PROTO;

/**
 * X-Forwarded-For address will replace the request address.
 * In case of multiple (comma separated) ip address in X-Forwarded-For, rightmost will replace the request address.
 *
 * Do not use ForwardedRequestCustomizer as the LB-supplied X-Forwarded-For value is *not* the left-most one, but the right-most one (i.e. the last one).
 *
 */
public class RemoteAddressCustomizer implements HttpConfiguration.Customizer {

    private static final Splitter COMMA_SPLITTER = Splitter.on(',').omitEmptyStrings().trimResults();

    @Override
    public Request customize(final Request request, final HttpFields.Mutable responseHeaders) {
        return new Request.Wrapper(request)
        {
            @Override
            public HttpURI getHttpURI() {
                return HttpURI.build(request.getHttpURI()).scheme(getScheme()).asImmutable();
            }

            @Override
            public ConnectionMetaData getConnectionMetaData() {
                return new ConnectionMetaData.Wrapper(request.getConnectionMetaData()) {
                    @Override
                    public SocketAddress getRemoteSocketAddress() {
                        return InetSocketAddress.createUnresolved(getXForwardedForAddress(request), Request.getRemotePort(request));
                    }

                    @Override
                    public boolean isSecure() {
                        return HttpScheme.HTTPS.name().equalsIgnoreCase(getScheme());
                    }
                };
            }

            public String getScheme() {
                final String header = getLastValidHeader(request, X_FORWARDED_PROTO.asString());
                if (Strings.isNullOrEmpty(header)) {
                    return request.getHttpURI().getScheme();
                }
                return header;
            }

            private String getXForwardedForAddress(final Request request) {
                final String header = getLastValidHeader(request, X_FORWARDED_FOR.asString());
                if (Strings.isNullOrEmpty(header)) {
                    return Request.getRemoteAddr(request);
                }
                return header;
            }

            @Nullable
            private String getLastValidHeader(final Request request, final String headerName) {
                final Enumeration<String> headers = request.getHeaders().getValues(headerName);
                while (headers.hasMoreElements()) {
                    final String next = headers.nextElement();
                    if (!headers.hasMoreElements() && !Strings.isNullOrEmpty(next)) {
                        return Iterables.getLast(COMMA_SPLITTER.split(next));
                    }
                }
                return null;
            }
        };
    }
}
