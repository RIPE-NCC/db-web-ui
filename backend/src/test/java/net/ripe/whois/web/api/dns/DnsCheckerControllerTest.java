package net.ripe.whois.web.api.dns;

import net.ripe.whois.services.crowd.CrowdClient;
import net.ripe.whois.services.crowd.UserSession;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.match.MockRestRequestMatchers;
import org.springframework.web.client.RestTemplate;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.isEmptyOrNullString;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RunWith(MockitoJUnitRunner.class)
public class DnsCheckerControllerTest {

    private static final String MOCK_DNS_CHECKER_URL = "http://localhost:8089";

    private final CrowdClient crowdClient = mock(CrowdClient.class);
    private final UserSession crowdUserSession = mock(UserSession.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private MockRestServiceServer mockServer = MockRestServiceServer.createServer(restTemplate);

    private final DnsCheckerController dnsCheckerController = new DnsCheckerController(MOCK_DNS_CHECKER_URL, crowdClient, restTemplate);

    @Before
    public void setup() {
        when(crowdClient.getUserSession(anyString())).thenReturn(crowdUserSession);
        when(crowdUserSession.isActive()).thenReturn(true);
    }

    @Test
    public void itShouldReturnOkWhenNsIsCorrect() {
        mockServer.expect(MockRestRequestMatchers.content().string("{\"method\": \"get_ns_ips\", \"params\": \"ns1.google.com\"}"))
                .andRespond(withSuccess("{'jsonrpc':'2.0','id':null,'result':[{'ns1.google.com':'216.239.32.10'}]}", MediaType.APPLICATION_JSON));

        final String crowdToken = "whatever";
        final ResponseEntity<String> statusResponse = dnsCheckerController.status(crowdToken, "ns1.google.com");

        assertThat(statusResponse.getStatusCode(), is(HttpStatus.OK));
        assertThat(statusResponse.getBody(), isEmptyOrNullString());
    }

    @Test
    public void itShouldReturnNotFoundWhenNsIsIncorrect() {
        mockServer.expect(MockRestRequestMatchers.content().string("{\"method\": \"get_ns_ips\", \"params\": \"ns1.crazy-eight.com\"}"))
                .andRespond(withSuccess("{'jsonrpc':'2.0','id':null,'result':[{'ns1.crazy-eight.com':'0.0.0.0'}]}", MediaType.APPLICATION_JSON));

        final String crowdToken = "whatever";
        final ResponseEntity<String> statusResponse = dnsCheckerController.status(crowdToken, "ns1.crazy-eight.com");

        assertThat(statusResponse.getStatusCode(), is(HttpStatus.NOT_FOUND));
        assertThat(statusResponse.getBody(), isEmptyOrNullString());
    }
}
