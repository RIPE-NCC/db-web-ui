package net.ripe.whois;

import org.eclipse.jetty.server.ServerConnector;
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
        });
    }
}
