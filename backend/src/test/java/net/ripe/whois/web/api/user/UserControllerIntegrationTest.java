package net.ripe.whois.web.api.user;

import jakarta.ws.rs.core.MediaType;
import net.ripe.whois.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class UserControllerIntegrationTest extends AbstractIntegrationTest {

    @Test
    public void get_maintainers_success() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/api/user/7bc1fcd3-cba2-4fa1-b9d9-215caa9e3346/maintainers?clientIp=127.0.0.1", getResource("mock/user-info-maintainers.xml"), MediaType.APPLICATION_XML, HttpStatus.OK.value());

        final ResponseEntity<String> response = get("/db-web-ui/api/user/mntners", String.class);

        assertThat(response.getBody(), is(
                "[{" +
                        "\"mine\":true," +
                        "\"auth\":[\"MD5-PW\",\"SSO\"]," +
                        "\"type\":\"mntner\"," +
                        "\"key\":\"TST14-RIPE\"" +
                        "}]"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
    }

    @Test
    public void get_maintainers_invalid_cookie() {
        mock("/api/user/info?clientIp=127.0.0.1", "", MediaType.APPLICATION_JSON, HttpStatus.UNAUTHORIZED.value());

        final ResponseEntity<String> response = get("/db-web-ui/api/user/mntners", String.class, invalidSsoCookie());

        assertThat(response.getStatusCode(), is(HttpStatus.UNAUTHORIZED));
    }
}
