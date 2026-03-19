package net.ripe.whois.config;

import net.ripe.whois.jetty.RedirectToHttpsRule;
import net.ripe.whois.jetty.RedirectWithQueryParamRule;
import net.ripe.whois.jetty.RemoteAddressCustomizer;
import org.eclipse.jetty.ee10.servlet.ServletContextHandler;
import org.eclipse.jetty.ee10.servlet.ServletHolder;
import org.eclipse.jetty.http.HttpStatus;
import org.eclipse.jetty.rewrite.handler.RedirectPatternRule;
import org.eclipse.jetty.rewrite.handler.RedirectRegexRule;
import org.eclipse.jetty.rewrite.handler.RewriteHandler;
import org.eclipse.jetty.rewrite.handler.RewriteRegexRule;
import org.eclipse.jetty.server.ConnectionFactory;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.CustomRequestLog;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.RequestLog;
import org.eclipse.jetty.server.RequestLogWriter;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.ServerConnector;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.ContextHandlerCollection;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.session.DefaultSessionIdManager;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.util.resource.ResourceFactory;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.jetty.JettyServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

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

    private final ApplicationContext applicationContext;

    @Autowired
    public JettyConfiguration(final ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

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

            // --- Spring Boot handler (/db-web-ui), default context
            final Handler bootHandler = server.getHandler();

            /* ---------------- API CONTEXT ---------------- */
            final ServletContextHandler apiContext = getApiContextHandler();

            /* ---------------- CONTEXT COLLECTION ---------------- */
            final ContextHandlerCollection contexts = new ContextHandlerCollection();
            contexts.addHandler(bootHandler);   // /db-web-ui (Spring Boot)
            contexts.addHandler(apiContext);    // /api (Public API)

            /* ---------------- ROOT HANDLER CHAIN ---------------- */
            final ContextHandlerCollection rootHandlers = new ContextHandlerCollection();

            rootHandlers.addHandler(resourceStaticHandler());
            rootHandlers.addHandler(badRequestRewriteHandler());
            rootHandlers.addHandler(contexts);

            final RewriteHandler rewriteHandler = rewriteHandler();
            rewriteHandler.setHandler(rootHandlers);

            // After rewrite rules, route to contexts
            server.setHandler(rewriteHandler);

            // --- Logging + remote address customizer
            server.setRequestLog(createRequestLog());
            addForwardedRequestCustomizerToAllConnectors(server);
        });

        return factory;
    }

    private @NonNull ServletContextHandler getApiContextHandler() {
        final ServletContextHandler apiContext = new ServletContextHandler(ServletContextHandler.NO_SESSIONS);
        apiContext.setContextPath("/api");

        final AnnotationConfigWebApplicationContext apiSpring = new AnnotationConfigWebApplicationContext();
        apiSpring.setParent(applicationContext);
        apiSpring.scan("net.ripe.api.publicapi");
        apiSpring.refresh();

        final DispatcherServlet apiDispatcher = new DispatcherServlet(apiSpring);
        apiContext.addServlet(new ServletHolder(apiDispatcher), "/*");
        apiDispatcher.setDetectAllHandlerMappings(false);
        apiDispatcher.setDetectAllHandlerAdapters(false);
        apiDispatcher.setDetectAllViewResolvers(false);
        apiDispatcher.setDetectAllHandlerExceptionResolvers(false);
        return apiContext;
    }

    private void addForwardedRequestCustomizerToAllConnectors(final Server server) {
        for (final Connector connector : server.getConnectors()) {
            final ConnectionFactory defaultConnectionFactory = connector.getDefaultConnectionFactory();
            if (defaultConnectionFactory instanceof HttpConnectionFactory) {
                ((HttpConnectionFactory) defaultConnectionFactory).getHttpConfiguration().addCustomizer(new RemoteAddressCustomizer());
            }
        }
    }

    private ContextHandler resourceStaticHandler() {
        final ResourceHandler resourceHandler = new ResourceHandler();
        final Resource base = ResourceFactory.of(resourceHandler).newClassLoaderResource("/static/", true);
        resourceHandler.setBaseResource(base);
        resourceHandler.setDirAllowed(false);
        resourceHandler.setCacheControl("public, max-age=31536000");

        ContextHandler contextHandler = new ContextHandler();
        contextHandler.setHandler(resourceHandler);
        return contextHandler;
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
        final RewriteRegexRule defaultRule = new RewriteRegexRule("^/db-web-ui/(.*)$", "/db-web-ui/$1");
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
