package net.ripe.whois;

import net.ripe.whois.jetty.RedirectWithQueryParamRule;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
import org.eclipse.jetty.rewrite.handler.ResponsePatternRule;
import org.eclipse.jetty.rewrite.handler.RewriteHandler;
import org.eclipse.jetty.rewrite.handler.RewriteRegexRule;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.session.DefaultSessionIdManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

/**
 * Spring boot doesn't allow to configure http and https through only application.properties
 * https://github.com/spring-projects/spring-boot/issues/2167
 */
@Component
public class JettyConfiguration implements WebServerFactoryCustomizer<JettyServletWebServerFactory> {

    @Value("${server.http.port:1082}")
    private int httpPort;

    @Value("${jetty.hostname:local}")
    private String workerName;

    @Override
    public void customize(JettyServletWebServerFactory factory) {
        factory.addServerCustomizers(server -> {
            ServerConnector httpConnector = new ServerConnector(server);
            httpConnector.setPort(httpPort);
            server.addConnector(httpConnector);
            DefaultSessionIdManager sessionIdManager = new DefaultSessionIdManager(server);
            sessionIdManager.setWorkerName(workerName);
            server.setSessionIdManager(sessionIdManager);
            server.setHandler(new HandlerList(rewriteHandler(), server.getHandler()));
        });
    }

    private RewriteHandler rewriteHandler() {
        final RewriteHandler rewriteHandler = new RewriteHandler();
        rewriteHandler.setRewriteRequestURI(true);
        rewriteHandler.setRewritePathInfo(true);

        rewriteHandler.addRule(new RedirectRegexRule("^/search/abuse-finder.html$", "https://www.ripe.net/support/abuse"));
        rewriteHandler.addRule(new RedirectRegexRule("^/search/geolocation-finder.html$", "https://stat.ripe.net/widget/geoloc"));

        rewriteHandler.addRule(withMovedPermanently(new RedirectRegexRule("^/$", "/db-web-ui/query")));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/webupdates", "/db-web-ui/"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/startup", "/db-web-ui/webupdates/select"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/syncupdates", "/db-web-ui/syncupdates"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/search/full-text.html", "/db-web-ui/fulltextsearch"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/search/query.html", "/db-web-ui/query"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/search/lookup.html", "/db-web-ui/lookup"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/search$", "/db-web-ui/query"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/change-auth$", "/db-web-ui/fmp/"));

        rewriteHandler.addRule(withMovedPermanently(new RedirectRegexRule("^/whois/lookup/ripe/(.*)$", "http://rest.db.ripe.net/ripe/$1")));

        final RewriteRegexRule defaultRule = new RewriteRegexRule("^/db-web-ui/(.*)$", "/db-web-ui/$1?$Q");
        defaultRule.setTerminating(true);
        rewriteHandler.addRule(defaultRule);

        rewriteHandler.addRule(new ResponsePatternRule("*", "400", ""));

        return rewriteHandler;
    }

    private RedirectRegexRule withMovedPermanently(final RedirectRegexRule redirectRegexRule) {
        redirectRegexRule.setStatusCode(HttpStatus.MOVED_PERMANENTLY_301);
        return redirectRegexRule;
    }

}
