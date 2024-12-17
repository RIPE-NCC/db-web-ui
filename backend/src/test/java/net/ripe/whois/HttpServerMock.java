package net.ripe.whois;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.MediaType;
import org.apache.commons.lang3.StringUtils;
import org.eclipse.jetty.ee10.servlet.ServletHolder;
import org.eclipse.jetty.ee10.webapp.WebAppContext;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.NetworkConnector;
import org.eclipse.jetty.server.Server;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.Map;
import java.util.Stack;
import java.util.concurrent.ConcurrentHashMap;

public class HttpServerMock {

    private static final Logger LOGGER = LoggerFactory.getLogger(HttpServerMock.class);

    private MockServlet mockServlet;
    private Server server;
    private int port = 0;

    Server createAndStartServer(final int port) {
        final WebAppContext context = new WebAppContext();
        context.setContextPath("/");
        context.setBaseResourceAsString("./");      // TODO: [ES] was src/main/webapp

        this.mockServlet = new MockServlet();
        mockServlet.deploy(context);

        try {
            return createAndStartServer(port, context);
        } catch (Exception e) {
            throw new RuntimeException("Unable to start server", e);
        }
    }

    private Server createAndStartServer(int port, Handler handler) throws Exception {
        final Server server = new Server(port);
        server.setHandler(handler);
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

        private final Map<String, Stack<Mock>> responseMap = new ConcurrentHashMap();

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

            final String key = StringUtils.isNotBlank(request.getQueryString())?
                request.getRequestURI() + "?" + request.getQueryString():
                request.getRequestURI();

            final Stack<Mock> mockResponse = responseMap.get(key);

            if (mockResponse == null || mockResponse.isEmpty()) {
                LOGGER.warn("Mock not found for {}", request.getRequestURI());
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, String.format("no mocked response found for %s: %s", method, request.getRequestURI()));
                return;
            }

            final Mock mock = mockResponse.pop();

            response.addHeader(HttpHeader.CONTENT_TYPE.toString(), mock.contentType);
            response.setStatus(mock.responseStatus);
            response.getWriter().write(mock.responseBody);
        }

        public void mock(final String uri, final String responseBody) {
            responseMap.computeIfAbsent(uri, s -> new Stack<>())
                .push(new Mock(responseBody, MediaType.APPLICATION_JSON, HttpStatus.OK.value()));
        }

        public void mock(final String key, final String responseBody, final String contentType, final int responseStatus) {
            responseMap.computeIfAbsent(key, s -> new Stack<>())
                .push(new Mock(responseBody, contentType, responseStatus));
        }
    }

    public void mock(final String uri, final String response) {
        this.mockServlet.mock(uri, response);
    }

    public void mock(final String pathAndQuery, final String responseBody, final String contentType, final int responseStatusCode, final String method) {
        final String key = pathAndQuery + (method == null ? "" : method.toLowerCase());
        this.mockServlet.mock(key, responseBody, contentType, responseStatusCode);
    }

    private static class Mock {

        private final String responseBody;
        private final String contentType;
        private final int responseStatus;

        public Mock(final String responseBody, final String contentType, final int responseStatus) {
            this.responseBody = responseBody;
            this.contentType = contentType;
            this.responseStatus = responseStatus;
        }
    }

}
