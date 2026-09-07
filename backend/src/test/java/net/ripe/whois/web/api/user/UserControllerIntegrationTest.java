package net.ripe.whois.web.api.user;

import jakarta.ws.rs.core.MediaType;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.oidc.KeycloakIdPDummyService;
import net.ripe.whois.oidc.OidcTestConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import java.io.IOException;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@Import(OidcTestConfig.class)
public class UserControllerIntegrationTest extends AbstractIntegrationTest {

    @Mock
    private OAuth2AuthenticationToken oAuth2AuthenticationToken;
    @Mock
    private OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;

    @Mock
    private OAuth2AuthorizedClient authorizedClient;

    @Autowired
    private KeycloakIdPDummyService keycloakIdPDummyService;

    @BeforeEach
    public void setup() throws IOException {
        keycloakIdPDummyService.registerUser("authorised",
                new KeycloakIdPDummyService.FakeUser("ba-apps-user", "ba-apps@example.com", "idp-sid-ba-apps"));

        when(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId()).thenReturn("keycloak");
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(oAuth2AuthorizedClientManager.authorize(any(OAuth2AuthorizeRequest.class))).thenReturn(authorizedClient);
    }

    @Test
    public void get_maintainers_success() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/api/user/7bc1fcd3-cba2-4fa1-b9d9-215caa9e3346/maintainers?clientIp=127.0.0.1", getResource("mock/user-info-maintainers.xml"), MediaType.APPLICATION_XML, HttpStatus.OK.value());

        final ResponseEntity<String> response = get("/db-web-ui/api/user/mntners", String.class);

        assertThat(response.getBody(), is(
                "[{" +
                        "\"mine\":true," +
                        "\"auth\":[\"SSO\"]," +
                        "\"type\":\"mntner\"," +
                        "\"key\":\"TST14-RIPE\"" +
                        "}]"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
    }

    @Test
    public void get_maintainers_invalid_cookie() {
        mock("/api/user/info?clientIp=127.0.0.1", "", MediaType.APPLICATION_JSON, HttpStatus.UNAUTHORIZED.value());

        final ResponseEntity<String> response = get("/db-web-ui/api/user/mntners", String.class, invalidOAuth2Client());

        assertThat(response.getStatusCode(), is(HttpStatus.UNAUTHORIZED));
    }
}
