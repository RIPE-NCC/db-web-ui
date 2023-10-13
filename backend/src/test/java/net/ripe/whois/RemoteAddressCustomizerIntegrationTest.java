package net.ripe.whois;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;

import java.util.List;

import static com.google.common.net.HttpHeaders.X_FORWARDED_FOR;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.startsWith;

public class RemoteAddressCustomizerIntegrationTest extends AbstractIntegrationTest {

    @AfterEach
    void clear() {
        clearJettyRequestLogFile();
    }

    @Test
    void should_log_client_ip() {
        get("/db-web-ui/", String.class);

        assertThat(readJettyRequestLogFile().get(0), startsWith("127.0.0.1"));
    }

    @Test
    void should_log_x_forwarded_for_header() {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add(X_FORWARDED_FOR, "10.0.0.0");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        get("/db-web-ui/", String.class, requestEntity);

        assertThat(readJettyRequestLogFile().get(0), startsWith("10.0.0.0"));
    }

    @Test
    void should_log_last_x_forwarded_for_header_value() {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.addAll(X_FORWARDED_FOR, List.of("10.0.0.0", "20.0.0.0"));
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        get("/db-web-ui/", String.class, requestEntity);

        assertThat(readJettyRequestLogFile().get(0), startsWith("20.0.0.0"));
    }
}
