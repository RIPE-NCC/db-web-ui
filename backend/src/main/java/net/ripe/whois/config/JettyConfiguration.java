package net.ripe.whois.config;

import net.ripe.whois.jetty.RedirectToHttpsRule;
import net.ripe.whois.jetty.RedirectWithQueryParamRule;
import net.ripe.whois.jetty.RemoteAddressCustomizer;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.RedirectPatternRule;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
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
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.session.DefaultSessionIdManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.ZoneOffset;
import java.util.regex.Pattern;

@Configuration
public class JettyConfiguration  {

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


    @Bean
    public ConfigurableServletWebServerFactory jettyCustomServlet() {
        return getConfigurableServletWebServerFactory();
    }

    private ConfigurableServletWebServerFactory getConfigurableServletWebServerFactory() {
        final JettyServletWebServerFactory factory = new JettyServletWebServerFactory();
        factory.addServerCustomizers(server -> {
            final ServerConnector httpConnector = new ServerConnector(server);
            httpConnector.setPort(httpPort);
            httpConnector.setIdleTimeout(idleTimeout * 1_000L);
            server.addConnector(httpConnector);
            final DefaultSessionIdManager sessionIdManager = new DefaultSessionIdManager(server);
            sessionIdManager.setWorkerName(workerName);
            server.addBean(sessionIdManager, true);
            server.insertHandler(rewriteHandler());
            server.insertHandler(resourceStaticHandler());
            server.insertHandler(badRequestRewriteHandler());
            server.setRequestLog(createRequestLog());
            addRemoteAddressCustomizerToAllConnectors(server);
        });
        return factory;
    }

    private void addRemoteAddressCustomizerToAllConnectors(final Server server) {
        for (final Connector connector : server.getConnectors()) {
            final ConnectionFactory defaultConnectionFactory = connector.getDefaultConnectionFactory();
            if (defaultConnectionFactory instanceof HttpConnectionFactory) {
                ((HttpConnectionFactory) defaultConnectionFactory).getHttpConfiguration().addCustomizer(new RemoteAddressCustomizer());
            }
        }
    }

    private ResourceHandler resourceStaticHandler(){
        final ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setBaseResourceAsString("./classes/static/");
        resourceHandler.setDirAllowed(false);
        resourceHandler.setCacheControl("public, max-age=31536000");
        return resourceHandler;
    }

    private RewriteHandler rewriteHandler() {
        final RewriteHandler rewriteHandler = new RewriteHandler();
        redirectRules(rewriteHandler);
        regexRules(rewriteHandler);
        return rewriteHandler;
    }

    private RewriteHandler badRequestRewriteHandler() {
        return new RewriteHandler();
    }

    private void regexRules(final RewriteHandler rewriteHandler) {
        final RewriteRegexRule defaultRule = new RewriteRegexRule("^/db-web-ui/(.*)$", "/db-web-ui/$1");        // TODO: [ES] dropped ?$Q
        defaultRule.setTerminating(true);
        rewriteHandler.addRule(defaultRule);
    }

    private void redirectRules(final RewriteHandler rewriteHandler) {
        final RedirectToHttpsRule redirectToHttpsRule = new RedirectToHttpsRule();
        redirectToHttpsRule.setTerminating(true);
        rewriteHandler.addRule(redirectToHttpsRule);
        rewriteHandler.addRule(new RedirectPatternRule("/search/abuse-finder.html", "https://www.ripe.net/support/abuse"));
        rewriteHandler.addRule(withMovedPermanently(new RedirectRegexRule("^/docs/?(.*)$", "https://docs.db.ripe.net/$1")));
        rewriteHandler.addRule(withMovedPermanently(new RedirectRegexRule("^/$", "/db-web-ui/query")));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/db-web-ui$", "/db-web-ui/query"));
        rewriteHandler.addRule(new RedirectWithQueryParamRule("^/docs$", "https://docs.db.ripe.net"));
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

        public FilteredSlf4jRequestLogWriter(final String keyToFilter, final String jettyAccessLogFilename,
                                             final String jettyAccessLogFileDateFormat, final int retainDays) {
            super(jettyAccessLogFilename);
            this.keyToFilter = keyToFilter;
            setFilenameDateFormat(jettyAccessLogFileDateFormat);
            setRetainDays(retainDays);
        }

        @Override
        public void write(final String requestEntry) throws IOException {
            final String filtered;
            if (keyToFilter != null && keyToFilter.equalsIgnoreCase("apikey")) {
                filtered = ApiKeyPattern.matcher(requestEntry).replaceAll("FILTERED");
            } else {
                filtered = PasswordPattern.matcher(requestEntry).replaceAll("FILTERED");
            }
            super.write(filtered);
        }
    }
}
