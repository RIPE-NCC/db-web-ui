package net.ripe.whois.jetty;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.http.HttpScheme;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.Rule;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.Response;
import org.eclipse.jetty.util.Callback;
import org.eclipse.jetty.util.URIUtil;

import java.io.IOException;

public class RedirectToHttpsRule extends Rule {

    @Override
    public Handler matchAndApply(Handler input) throws IOException {
        if (hasTransport(input)) {
            return new Handler(input)
            {
                @Override
                protected boolean handle(final Response response, final Callback callback)
                {
                    final StringBuilder location = new StringBuilder();
                    URIUtil.appendSchemeHostPort(location, HttpScheme.HTTPS.toString(), Request.getServerName(input), HttpScheme.HTTPS.getDefaultPort());
                    location.append(input.getHttpURI());

                    final String queryString = input.getHttpURI().getQuery();
                    if (StringUtils.isNotBlank(queryString)) {
                        location.append("?").append(queryString);
                    }

                    response.setStatus(HttpStatus.MOVED_PERMANENTLY_301);
                    response.getHeaders().put(HttpHeader.LOCATION, location.toString());

                    callback.succeeded();
                    return true;
                }
            };
        }
        return null;
    }

    private boolean hasTransport(final Request request) {
        final String value = request.getHeaders().get(HttpHeader.X_FORWARDED_PROTO);
        return !StringUtils.isEmpty(value) && HttpScheme.HTTP.is(value);
    }

}
