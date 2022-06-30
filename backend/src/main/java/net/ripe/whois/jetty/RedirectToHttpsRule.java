package net.ripe.whois.jetty;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.http.HttpScheme;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.Rule;
import org.eclipse.jetty.util.URIUtil;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class RedirectToHttpsRule extends Rule {

    @Override
    public String matchAndApply(String target, HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (hasTransport(request)) {
            StringBuilder location = new StringBuilder();
            URIUtil.appendSchemeHostPort(location, HttpScheme.HTTPS.toString(), request.getServerName(), 443);
            location.append(request.getRequestURI());

            if (StringUtils.isNotBlank(request.getQueryString())) {
                location.append("?").append(request.getQueryString());
            }

            response.setHeader("Location", location.toString());
            response.setStatus(HttpStatus.MOVED_PERMANENTLY_301);
            response.getOutputStream().flush(); // no output / content
            response.getOutputStream().close();
            return target;
        }
        return null;
    }

    private boolean hasTransport(final HttpServletRequest request) {
        final String header = request.getHeader(HttpHeader.X_FORWARDED_PROTO.toString());
        return !StringUtils.isEmpty(header) && HttpScheme.HTTP.is(header);
    }

}
