package net.ripe.whois.jetty;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
import org.eclipse.jetty.server.Response;
import org.eclipse.jetty.util.Callback;
import org.eclipse.jetty.util.annotation.Name;

import java.io.IOException;
import java.util.regex.Matcher;

public class RedirectWithQueryParamRule extends RedirectRegexRule {

    public RedirectWithQueryParamRule(@Name("regex") String regex, @Name("location") String location) {
        super(regex, location);
    }

    @Override
    protected Handler apply(final Handler input, final Matcher matcher) throws IOException {
        return new Handler(input)
        {
            @Override
            protected boolean handle(final Response response, final Callback callback)
            {
                final String queryString = input.getHttpURI().getQuery();
                final String location = StringUtils.isNotBlank(queryString) ?
                    Response.toRedirectURI(input, getLocation()) + "?" + queryString :
                    Response.toRedirectURI(input, getLocation());

                response.setStatus(HttpStatus.MOVED_PERMANENTLY_301);
                response.getHeaders().put(HttpHeader.LOCATION, location);

                callback.succeeded();
                return true;
            }
        };
    }
}
