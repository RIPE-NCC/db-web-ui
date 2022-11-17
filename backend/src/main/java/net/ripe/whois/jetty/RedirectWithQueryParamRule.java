package net.ripe.whois.jetty;

import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
import org.eclipse.jetty.rewrite.handler.RedirectUtil;
import org.eclipse.jetty.util.annotation.Name;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Matcher;

public class RedirectWithQueryParamRule extends RedirectRegexRule {

    public RedirectWithQueryParamRule(@Name("regex") String regex, @Name("location") String location) {
        super(regex, location);
    }

    @Override
    protected String apply(String target, HttpServletRequest request, HttpServletResponse response, Matcher matcher) throws IOException {
        String newTarget = response.encodeRedirectURL(_location);
        final String location = StringUtils.isNotBlank(request.getQueryString()) ?
            RedirectUtil.toRedirectURL(request, newTarget) + "?" + request.getQueryString() :
            RedirectUtil.toRedirectURL(request, newTarget);

        response.setHeader("Location", location);
        response.setStatus(HttpStatus.MOVED_PERMANENTLY_301);
        response.getOutputStream().flush(); // no output / content
        response.getOutputStream().close();
        return newTarget;
    }

}
