package net.ripe.whois.web.api.dns;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import org.junit.Rule;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.equalToJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.isEmptyOrNullString;
import static org.junit.Assert.assertThat;

public class DnsCheckerControllerTest {

    @Rule
    public WireMockRule wireMockRule = new WireMockRule(8089);

    private static final String DNS_CHECKER_URL = "http://localhost:8089";

    private final DnsCheckerController dnsCheckerController = new DnsCheckerController(DNS_CHECKER_URL);

    @Test
    public void itShouldReturnJustOkWhenNsIsCorrect() {
        final String request = "{'method': 'get_ns_ips', 'params': 'ns1.google.com'}";

        stubFor(post(urlEqualTo("/")).withRequestBody(equalToJson(request))
            .willReturn(
                aResponse()
                    .withStatus(HttpStatus.OK.value())));

        final ResponseEntity<String> response = dnsCheckerController.search("ns1.google.com");

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), isEmptyOrNullString());
    }

}
