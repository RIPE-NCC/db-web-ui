package net.ripe.whois.oidc;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * A minimal standalone HTTP server (no extra dependencies — uses the JDK's built-in
 * com.sun.net.httpserver) that serves TestJwtSupport's public key as a JWKS document.
 * Runs independently of the Spring Boot app under test, so its port is known at
 * @BeforeAll time — just like HttpServerMock — avoiding the random-port timing problem.
 */
public class TestJwksDummyService {

    private HttpServer server;
    private int port;

    public void start() {
        try {
            server = HttpServer.create(new InetSocketAddress(0), 0);

            server.createContext("/test-jwks", exchange -> respond(exchange, TestJwtSupport.jwksJson()));

            // The actual discovery document Spring Boot's OAuth2ClientPropertiesMapper
            // fetches whenever issuer-uri is set — this MUST succeed for the app to
            // start at all. Only jwks_uri needs to be genuinely correct (used for real
            // back-channel logout signature verification); the other endpoints are
            // never dereferenced since our custom test beans intercept those flows.
            server.createContext("/realms/ripe-ncc/.well-known/openid-configuration", exchange -> {
                String base = "http://localhost:" + port;
                String discoveryJson = """
            {
              "issuer": "%s/realms/ripe-ncc",
              "authorization_endpoint": "%s/auth",
              "token_endpoint": "%s/token",
              "userinfo_endpoint": "%s/userinfo",
              "jwks_uri": "%s/test-jwks",
              "response_types_supported": ["code"],
              "subject_types_supported": ["public"],
              "id_token_signing_alg_values_supported": ["RS256"]
            }
            """.formatted(base, base, base, base, base);
                respond(exchange, discoveryJson);
            });

            server.start();
            port = server.getAddress().getPort();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private void respond(HttpExchange exchange, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    public int getPort() {
        return server.getAddress().getPort();
    }
}
