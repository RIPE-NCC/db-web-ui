package net.ripe.whois.web.api.dns;

import net.ripe.whois.services.crowd.CrowdClient;
import net.ripe.whois.services.crowd.CrowdClientException;
import net.ripe.whois.services.crowd.UserSession;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class DnsCheckerControllerTest {

    private static final String CROWD_TOKEN = "rRrR5L8b9zksKdrl6r1zYg00";

    @Mock
    private CrowdClient crowdClient;
    @Mock
    private UserSession userSession;
    @Mock
    private DnsClient dnsClient;
    @InjectMocks
    private DnsCheckerController subject;

    @Before
    public void setup() {
        when(crowdClient.getUserSession(CROWD_TOKEN)).thenReturn(userSession);
        when(userSession.isActive()).thenReturn(true);
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenReturn(Optional.empty());
    }

    @Test
    public void success() {
        final ResponseEntity<DnsCheckerController.Response> response = subject.status(CROWD_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getBody().getMessage(), is("Server is authoritative for 1.2.3.4.in-addr.arpa"));
        assertThat(response.getBody().getCode(), is(0));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void inactive_crowd_session() {
        when(userSession.isActive()).thenReturn(false);

        final ResponseEntity<DnsCheckerController.Response> response = subject.status(CROWD_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.UNAUTHORIZED));
        assertThat(response.getBody(), is(nullValue()));
    }

    @Test
    public void invalid_crowd_session() {
        when(crowdClient.getUserSession(CROWD_TOKEN)).thenThrow(new CrowdClientException("invalid"));

        final ResponseEntity<DnsCheckerController.Response> response = subject.status(CROWD_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.UNAUTHORIZED));
        assertThat(response.getBody(), is(nullValue()));
    }

    @Test
    public void dnsclient_tcp_error() {
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenAnswer(invocation -> Optional.of("invalid answer over TCP"));

        final ResponseEntity<DnsCheckerController.Response> response = subject.status(CROWD_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("invalid answer over TCP"));
        assertThat(response.getBody().getCode(), is(-1));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void dnsclient_udp_error() {
        when(dnsClient.checkDnsConfig(any(String.class), any(String.class))).thenAnswer(invocation -> Optional.of("invalid answer over UDP"));

        final ResponseEntity<DnsCheckerController.Response> response = subject.status(CROWD_TOKEN, "ns.ripe.net", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("invalid answer over UDP"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("ns.ripe.net"));
    }

    @Test
    public void nameserver_invalid_input() {
        final ResponseEntity<DnsCheckerController.Response> response = subject.status(CROWD_TOKEN, "{invalid}", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("Invalid characters in input"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("{invalid}"));
    }

    @Test public void nameserver_invalid() {
        ResponseEntity<DnsCheckerController.Response> response = subject.status(CROWD_TOKEN, "1.2.3.4", "1.2.3.4.in-addr.arpa");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody().getMessage(), is("Could not resolve 1.2.3.4"));
        assertThat(response.getBody().getCode(), is(- 1));
        assertThat(response.getBody().getNs(), is("1.2.3.4"));

        response = subject.status(CROWD_TOKEN, "::0", "1.2.3.4.in-addr.arpa");
        assertThat(response.getBody().getMessage(), is("Could not resolve ::0"));
    }

}
