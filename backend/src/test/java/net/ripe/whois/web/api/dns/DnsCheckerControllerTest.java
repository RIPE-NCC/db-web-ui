package net.ripe.whois.web.api.dns;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.OAuth2AccessToken;

import java.io.IOException;
import java.time.Instant;
import java.util.Optional;

import static net.ripe.whois.AbstractIntegrationTest.getResource;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DnsCheckerControllerTest {

    private static final OAuth2AccessToken ACCESS_TOKEN = new OAuth2AccessToken(
        OAuth2AccessToken.TokenType.BEARER,
        "mock-access-token",
        Instant.now(),
        Instant.now().plusSeconds(3600)
    );

    @Mock
    private WhoisInternalService whoisInternalService;
    @Mock
    private DnsClient dnsClient;
    @Mock
    private HttpServletRequest request;
    @Mock
    private OAuth2AuthenticationToken oAuth2AuthenticationToken;
    @Mock
    private OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;

    @Mock
    private OAuth2AuthorizedClient authorizedClient;
    private DnsCheckerController subject;

    @BeforeEach
    public void setup() throws IOException {
        subject = new DnsCheckerController(whoisInternalService, dnsClient, oAuth2AuthorizedClientManager,false);
        when(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId()).thenReturn("keycloak");
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(oAuth2AuthorizedClientManager.authorize(any(OAuth2AuthorizeRequest.class))).thenReturn(authorizedClient);
        when(request.getRemoteAddr()).thenReturn("");
        when(whoisInternalService.getUserInfo(ACCESS_TOKEN.getTokenValue(), ""))
            .thenReturn(getResource("mock/user-info.json", UserInfoResponse.class));
    }

    @Test
    public void success() {
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenReturn(Optional.empty());
        final ResponseEntity<DnsCheckerController.Response> response = subject.status(request, oAuth2AuthenticationToken,
            "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getBody().getMessage(), is("Server is authoritative for 1.2.3.4.in-addr.arpa"));
        assertThat(response.getBody().getCode(), is(0));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void inactive_sso_session() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(whoisInternalService.getUserInfo(ACCESS_TOKEN.getTokenValue(), "")).thenThrow(new RestClientException(401,
                "Unauthorized"));
        assertThrows(RestClientException.class, () -> subject.status(request, oAuth2AuthenticationToken, "ns.ripe.net", "1.2.3.4.in-addr.arpa"));
    }

    @Test
    public void dnsclient_tcp_error() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenAnswer(invocation -> Optional.of("invalid answer over TCP"));

        final ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, oAuth2AuthenticationToken, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("invalid answer over TCP"));
        assertThat(response.getBody().getCode(), is(-1));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void dnsclient_udp_error() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenAnswer(invocation -> Optional.of("invalid answer over UDP"));

        final ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, oAuth2AuthenticationToken, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("invalid answer over UDP"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void nameserver_invalid_input() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        final ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, oAuth2AuthenticationToken, "{invalid}", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("Invalid characters in input"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("{invalid}"));
    }

    @Test
    public void nameserver_invalid() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, oAuth2AuthenticationToken, "1.2.3.4", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("Could not resolve 1.2.3.4"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("1.2.3.4"));

        response = subject.status(request, oAuth2AuthenticationToken, "::0", "1.2.3.4.in-addr.arpa");
        assertThat(response.getBody().getMessage(), is("Could not resolve ::0"));
    }

    @Test
    public void dns_check_disabled() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        DnsCheckerController controllerWithDnsCheckDisabled = new DnsCheckerController(whoisInternalService,
                dnsClient, oAuth2AuthorizedClientManager,true);

        ResponseEntity<DnsCheckerController.Response> response =
            controllerWithDnsCheckDisabled.status(request, oAuth2AuthenticationToken, "ns.example.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getBody().getMessage(), is("Server is authoritative for 1.2.3.4.in-addr.arpa"));
        assertThat(response.getBody().getCode(), is(0));
        assertThat(response.getBody().getNs(), is("ns.example.net"));

        verifyNoInteractions(dnsClient);
    }

}
