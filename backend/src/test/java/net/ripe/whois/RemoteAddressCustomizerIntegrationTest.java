package net.ripe.whois;

import com.google.common.io.Files;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.util.List;

import static com.google.common.net.HttpHeaders.X_FORWARDED_FOR;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RemoteAddressCustomizerIntegrationTest extends AbstractIntegrationTest {

    @BeforeEach
    void tearDown() throws IOException {
        Files.write(new byte[0], Path.of(getJettyRequestLogFile()).toFile());
    }

    @Test
    void should_log_client_ip() throws IOException {
        restTemplate.exchange(getServerUrl() + "/db-web-ui/", HttpMethod.GET, new HttpEntity<>(null), String.class);

        final String logEntry = Files.readLines(Path.of(getJettyRequestLogFile()).toFile(), Charset.defaultCharset()).get(0);
        assertTrue(logEntry.startsWith("127.0.0.1"));
    }

    @Test
    void should_log_x_forwarded_for_header() throws IOException {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add(X_FORWARDED_FOR, "10.0.0.0");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        restTemplate.exchange(getServerUrl() + "/db-web-ui/", HttpMethod.GET, requestEntity, String.class);

        final String logEntry = Files.readLines(Path.of(getJettyRequestLogFile()).toFile(), Charset.defaultCharset()).get(0);
        assertTrue(logEntry.startsWith("10.0.0.0"));
    }

    @Test
    void should_log_last_x_forwarded_for_header_value() throws IOException {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.addAll(X_FORWARDED_FOR, List.of("10.0.0.0", "20.0.0.0"));
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        restTemplate.exchange(getServerUrl() + "/db-web-ui/", HttpMethod.GET, requestEntity, String.class);

        final String logEntry = Files.readLines(Path.of(getJettyRequestLogFile()).toFile(), Charset.defaultCharset()).get(0);
        assertTrue(logEntry.startsWith("20.0.0.0"));
    }
}
