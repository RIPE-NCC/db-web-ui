package net.ripe.whois.jetty;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
import org.eclipse.jetty.util.annotation.Name;

import java.io.IOException;

public class DocsHostPermanentRedirectRegexRule extends RedirectRegexRule {

    public DocsHostPermanentRedirectRegexRule(@Name("regex") String regex, @Name("location") String location){
        super(regex, location);
    }

    @Override
    public String matchAndApply(final String target, final HttpServletRequest request, final HttpServletResponse response) throws IOException {
        String host = request.getServerName();
        if (host.matches("docs.db.ripe.net")) {
            final String newTarget = super.matchAndApply(target, request, response);
            if (newTarget != null) {
                response.setStatus(HttpStatus.MOVED_PERMANENTLY_301);
                response.setHeader("Location", newTarget);
                response.flushBuffer();
                return newTarget;
            }
        }
        return null;
    }
}
