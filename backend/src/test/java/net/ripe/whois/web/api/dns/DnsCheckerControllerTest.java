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

import java.io.IOException;
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

    private static final String SSO_TOKEN = "rRrR5L8b9zksKdrl6r1zYg00";

    @Mock
    private WhoisInternalService whoisInternalService;
    @Mock
    private DnsClient dnsClient;
    @Mock
    private HttpServletRequest request;

    private DnsCheckerController subject;

    @BeforeEach
    public void setup() throws IOException {
        subject = new DnsCheckerController(whoisInternalService, dnsClient, false);
        when(request.getRemoteAddr()).thenReturn("");
        when(whoisInternalService.getUserInfo(SSO_TOKEN, ""))
            .thenReturn(getResource("mock/user-info.json", UserInfoResponse.class));
    }

    @Test
    public void success() {
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenReturn(Optional.empty());
        final ResponseEntity<DnsCheckerController.Response> response = subject.status(request, SSO_TOKEN,
            "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getBody().getMessage(), is("Server is authoritative for 1.2.3.4.in-addr.arpa"));
        assertThat(response.getBody().getCode(), is(0));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void inactive_sso_session() {
        when(whoisInternalService.getUserInfo(SSO_TOKEN, "")).thenThrow(new RestClientException(401, "Unauthorized"));
        assertThrows(RestClientException.class,
            () -> subject.status(request, SSO_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa"));
    }

    @Test
    public void dnsclient_tcp_error() {
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenAnswer(invocation -> Optional.of("invalid answer over TCP"));

        final ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, SSO_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("invalid answer over TCP"));
        assertThat(response.getBody().getCode(), is(-1));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void dnsclient_udp_error() {
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenAnswer(invocation -> Optional.of("invalid answer over UDP"));

        final ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, SSO_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("invalid answer over UDP"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void nameserver_invalid_input() {
        final ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, SSO_TOKEN, "{invalid}", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("Invalid characters in input"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("{invalid}"));
    }

    @Test
    public void nameserver_invalid() {
        ResponseEntity<DnsCheckerController.Response> response =
            subject.status(request, SSO_TOKEN, "1.2.3.4", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("Could not resolve 1.2.3.4"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("1.2.3.4"));

        response = subject.status(request, SSO_TOKEN, "::0", "1.2.3.4.in-addr.arpa");
        assertThat(response.getBody().getMessage(), is("Could not resolve ::0"));
    }

    @Test
    public void dns_check_disabled() {

        DnsCheckerController controllerWithDnsCheckDisabled = new DnsCheckerController(whoisInternalService, dnsClient, true);

        ResponseEntity<DnsCheckerController.Response> response =
            controllerWithDnsCheckDisabled.status(request, SSO_TOKEN, "ns.example.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getBody().getMessage(), is("Server is authoritative for 1.2.3.4.in-addr.arpa"));
        assertThat(response.getBody().getCode(), is(0));
        assertThat(response.getBody().getNs(), is("ns.example.net"));

        verifyNoInteractions(dnsClient);
    }

}
