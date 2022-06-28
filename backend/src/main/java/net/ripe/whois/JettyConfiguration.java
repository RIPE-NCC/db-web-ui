package net.ripe.whois;

import net.ripe.whois.jetty.HttpTransportRule;
import net.ripe.whois.jetty.RedirectToHttpsRule;
import net.ripe.whois.jetty.RedirectWithQueryParamRule;
import net.ripe.whois.jetty.RemoteAddressCustomizer;
import org.eclipse.jetty.http.HttpScheme;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
import org.eclipse.jetty.rewrite.handler.ResponsePatternRule;
import org.eclipse.jetty.rewrite.handler.RewriteHandler;
import org.eclipse.jetty.rewrite.handler.RewriteRegexRule;
import org.eclipse.jetty.server.ConnectionFactory;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.CustomRequestLog;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.RequestLog;
import org.eclipse.jetty.server.RequestLogWriter;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.server.session.DefaultSessionIdManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.ZoneOffset;
import java.util.regex.Pattern;

/**
 * Spring boot doesn't allow configuring http and https through only application.properties
 * https://github.com/spring-projects/spring-boot/issues/2167
 */
@Component
public class JettyConfiguration implements WebServerFactoryCustomizer<JettyServletWebServerFactory> {

    private static final String EXTENDED_RIPE_LOG_FORMAT = "%{client}a %{host}i - %u %{dd/MMM/yyyy:HH:mm:ss Z|" + ZoneOffset.systemDefault().getId() + "}t \"%r\" %s %O %D \"%{Referer}i\" \"%{User-Agent}i\"";

    @Value("${server.http.port:1082}")
    private int httpPort;

    @Value("${jetty.idle.timeout:60}")
    private int idleTimeout;

    @Value("${jetty.hostname:local}")
    private String workerName;

    @Value("${jetty.accesslog.filename}")
    private String jettyAccessLogFilename;

    @Value("${jetty.accesslog.file-date-format}")
    private String jettyAccessLogFileDateFormat;

    @Value("${jetty.accesslog.retention-period}")
    private int jettyAccessLogRetentionPeriod;

    @Value("${spring.profiles.active:}")
    private String activeProfile;
    @Override
    public void customize(final JettyServletWebServerFactory factory) {
        factory.addServerCustomizers(server -> {
            ServerConnector httpConnector = new ServerConnector(server);
            httpConnector.setPort(httpPort);
            httpConnector.setIdleTimeout(idleTimeout * 1_000L);
            server.addConnector(httpConnector);
            DefaultSessionIdManager sessionIdManager = new DefaultSessionIdManager(server);
            sessionIdManager.setWorkerName(workerName);
            server.setSessionIdManager(sessionIdManager);


            server.setHandler(new HandlerList(resourceHandler(),rewriteHandler(),server.getHandler() ));
            server.setRequestLog(createRequestLog());
            addRemoteAddressCustomizerToAllConnectors(server);
        });
    }

    private void addRemoteAddressCustomizerToAllConnectors(final Server server) {
        for (final Connector connector : server.getConnectors()) {
            final ConnectionFactory defaultConnectionFactory = connector.getDefaultConnectionFactory();
            if (defaultConnectionFactory instanceof HttpConnectionFactory) {
                ((HttpConnectionFactory) defaultConnectionFactory).getHttpConfiguration().addCustomizer(new RemoteAddressCustomizer());
            }
        }
    }


    private ContextHandler resourceHandler(){
        ResourceHandler staticResourceHandler = new ResourceHandler();
        if("test".equals(activeProfile) ){
            staticResourceHandler.setResourceBase("src/test/resources/docs");
        }else{
            staticResourceHandler.setResourceBase("docs");
        }
        staticResourceHandler.setDirectoriesListed(true);

        ContextHandler contextHandler= new ContextHandler("/docs/");
        contextHandler.setHandler(staticResourceHandler);

        return contextHandler;
    }
    private RewriteHandler rewriteHandler() {
        final RewriteHandler rewriteHandler = new RewriteHandler();
        rewriteHandler.setRewriteRequestURI(true);
        rewriteHandler.setRewritePathInfo(true);

        rewriteHandler.addRule(new HttpTransportRule(HttpScheme.HTTP, new RedirectToHttpsRule() ));
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
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/db-web-ui$", "/db-web-ui/query"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/docs$", "/docs/"));

        final RewriteRegexRule defaultDocRule = new RewriteRegexRule("^/docs/(.*)$", "/docs/$1");
        defaultDocRule.setTerminating(true);
        rewriteHandler.addRule(defaultDocRule);

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

    private RequestLog createRequestLog() {
        return new CustomRequestLog(new FilteredSlf4jRequestLogWriter(
            "password", jettyAccessLogFilename, jettyAccessLogFileDateFormat, jettyAccessLogRetentionPeriod), EXTENDED_RIPE_LOG_FORMAT);
    }

    private static class FilteredSlf4jRequestLogWriter extends RequestLogWriter {

        private final String keyToFilter;
        // Replace value passed to apikey with "FILTERED" but leave the last 3 characters if its API keys
        private final Pattern ApiKeyPattern = Pattern.compile("(?<=(?i)(apikey=))(.+?(?=\\S{3}[&|\\s]))");
        private final Pattern PasswordPattern = Pattern.compile("(?<=(?i)(password=))([^&]*)");

        public FilteredSlf4jRequestLogWriter(String keyToFilter, String jettyAccessLogFilename,
                                             String jettyAccessLogFileDateFormat, int retainDays) {
            super(jettyAccessLogFilename);
            this.keyToFilter = keyToFilter;
            setFilenameDateFormat(jettyAccessLogFileDateFormat);
            setRetainDays(retainDays);
        }

        @Override
        public void write(String requestEntry) throws IOException {
            String filtered;

            if (keyToFilter != null && keyToFilter.equalsIgnoreCase("apikey")) {
                filtered = ApiKeyPattern.matcher(requestEntry).replaceAll("FILTERED");
            } else {
                filtered = PasswordPattern.matcher(requestEntry).replaceAll("FILTERED");
            }

            super.write(filtered);
        }
    }
}
