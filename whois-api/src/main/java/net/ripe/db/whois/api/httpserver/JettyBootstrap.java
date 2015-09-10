package net.ripe.db.whois.api.httpserver;

import net.ripe.db.whois.common.ApplicationService;
import net.ripe.db.whois.common.aspects.RetryFor;
import org.apache.commons.lang.StringUtils;
import org.eclipse.jetty.jmx.ConnectorServer;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.FilterHolder;
import org.eclipse.jetty.util.resource.Resource;
import org.eclipse.jetty.webapp.WebAppContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.management.remote.JMXServiceURL;
import javax.servlet.DispatcherType;
import java.rmi.registry.LocateRegistry;
import java.util.EnumSet;
import java.util.List;

@Component
public class JettyBootstrap implements ApplicationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(JettyBootstrap.class);

    private final RemoteAddressFilter remoteAddressFilter;
    private final ExtensionOverridesAcceptHeaderFilter extensionOverridesAcceptHeaderFilter;
    private final List<ServletDeployer> servletDeployers;
    private Server server;

    private int port = 0;

    @Value("${port.api}")
    public void setPort(final int port) {
        if (port > 0) {
            this.port = port;
        }
    }

    public int getPort() {
        return port;
    }

    @Autowired
    public JettyBootstrap(final RemoteAddressFilter remoteAddressFilter,
                          final ExtensionOverridesAcceptHeaderFilter extensionOverridesAcceptHeaderFilter,
                          final List<ServletDeployer> servletDeployers) {
        this.remoteAddressFilter = remoteAddressFilter;
        this.extensionOverridesAcceptHeaderFilter = extensionOverridesAcceptHeaderFilter;
        this.servletDeployers = servletDeployers;
    }

    @Override
    public void start() {
        server = createAndStartServer(port);
    }

    // handler to serve static resources directly from jetty
    ResourceHandler getStaticResourceHandler(String resourceBase) {
        ResourceHandler resourceHandler = new ResourceHandler();
        resourceHandler.setBaseResource(Resource.newClassPathResource(resourceBase));
        return resourceHandler;
    }

    Server createAndStartServer(final int port) {
        final WebAppContext context = new WebAppContext();
        context.setContextPath("/");
        context.setResourceBase("src/main/webapp");
        context.addFilter(new FilterHolder(remoteAddressFilter), "/*", EnumSet.allOf(DispatcherType.class));
        context.addFilter(new FilterHolder(extensionOverridesAcceptHeaderFilter), "/*", EnumSet.allOf(DispatcherType.class));

        final HandlerList handlers = new HandlerList();
        handlers.setHandlers(new Handler[]{context});

        for (final ServletDeployer servletDeployer : servletDeployers) {
            servletDeployer.deploy(context);
        }

        try {
            return createAndStartServer(port, handlers);
        } catch (Exception e) {
            throw new RuntimeException("Unable to start server", e);
        }
    }

    @RetryFor(attempts = 5, value = Exception.class)
    private Server createAndStartServer(int port, HandlerList handlers) throws Exception {
        final Server server = new Server(port);

        startRemoteJMXSupport();

        server.setHandler(handlers);
        server.setStopAtShutdown(true);
        server.start();
        this.port = server.getConnectors()[0].getLocalPort();
        LOGGER.info("Jetty started on port {}", this.port);
        return server;
    }

    @Override
    public void stop(final boolean force) {
        new Thread() {
            @Override
            public void run() {
                try {
                    server.stop();
                } catch (Exception e) {
                    LOGGER.error("Stopping server", e);
                }
            }
        }.start();

        try {
            server.join();
        } catch (InterruptedException e) {
            LOGGER.error("Stopping server", e);
        }
    }

    private void startRemoteJMXSupport() {

        final String jmxPortStr = System.getProperty("jetty.jmxrmiport");
        //TODO [TP]: jmx port can be supplied via the whois.properties files and not via the whois init script
        if (StringUtils.isBlank(jmxPortStr)){
            LOGGER.info("jetty.jmxrmiport is not provided. Skipping JMX support.");
            return;
        }

        try {
            final int port = Integer.valueOf(jmxPortStr);

            LocateRegistry.createRegistry(port);
            Thread.sleep(1000);
            LOGGER.info("Created registry and bound it to supplied JMX port");

            final JMXServiceURL jmxUrl = new JMXServiceURL("rmi", "localhost", port,
                    String.format("/jndi/rmi://localhost:%s/jmxrmi", port));
            final ConnectorServer connectorServer = new ConnectorServer(jmxUrl, "org.eclipse.jetty.jmx:name=rmiconnectorserver");
            connectorServer.start();
            LOGGER.info("Started JMX Connector server");
        } catch (Exception e) {
            LOGGER.error(String.format("cannot start JMX connector server on port: %s", jmxPortStr), e);
        }
    }

}