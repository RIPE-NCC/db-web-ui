package net.ripe.whois;


import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.NetworkConnector;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.webapp.WebAppContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.HttpHeaders;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class HttpServerMock {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpServerMock.class);

    private MockServlet mockServlet;
    private Server server;
    private int port = 0;

    Server createAndStartServer(final int port) {
        final WebAppContext context = new WebAppContext();
        context.setContextPath("/");
        context.setResourceBase("src/main/webapp");

        final HandlerList handlers = new HandlerList();
        handlers.setHandlers(new Handler[]{context});

        this.mockServlet = new MockServlet();
        mockServlet.deploy(context);

        try {
            return createAndStartServer(port, handlers);
        } catch (Exception e) {
            throw new RuntimeException("Unable to start server", e);
        }
    }

    private Server createAndStartServer(int port, HandlerList handlers) throws Exception {
        final Server server = new Server(port);
        server.setHandler(handlers);
        server.setStopAtShutdown(true);
        server.start();
        this.port = ((NetworkConnector)server.getConnectors()[0]).getLocalPort();
        LOGGER.info("Jetty started on port {}", this.port);
        return server;
    }

    public void start() {
        server = createAndStartServer(port);
    }

    public void stop() {
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

    public int getPort() {
        return port;
    }

    private static class MockServlet extends HttpServlet {

        private final Map<String, String> responseMap = new ConcurrentHashMap();

        public void deploy(final WebAppContext context) {
            context.addServlet(new ServletHolder("mock servlet", this), "/*");
        }

        @Override
        protected void doGet(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
            handleResponse(HttpMethod.GET, request, response);
        }

        @Override
        protected void doPost(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
            handleResponse(HttpMethod.POST, request, response);
        }

        @Override
        protected void doPut(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
            handleResponse(HttpMethod.PUT, request, response);
        }

        @Override
        protected void doDelete(final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
            handleResponse(HttpMethod.DELETE, request, response);
        }

        private void handleResponse(final HttpMethod method, final HttpServletRequest request, final HttpServletResponse response) throws ServletException, IOException {
            final String mockResponse = responseMap.remove(request.getRequestURI());
            if (mockResponse != null) {
                response.setHeader(HttpHeaders.CONTENT_TYPE, "application/xml;charset=UTF-8");
                response.getWriter().write(mockResponse);
            } else {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, String.format("no mocked response found for %s: %s", method, request.getRequestURI()));
            }
        }


        public void mock(final String uri, final String response) {
            responseMap.put(uri, response);
        }
    }

    public void mock(final String uri, final String response) {
        this.mockServlet.mock(uri, response);
    }

}
