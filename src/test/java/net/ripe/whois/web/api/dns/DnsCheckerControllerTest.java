package net.ripe.whois.web.api.dns;

import com.github.tomakehurst.wiremock.client.MappingBuilder;
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
    public void itShouldReturnOkWhenNsIsCorrect() {

        final String request = "{'method': 'get_ns_ips', 'params': 'ns1.google.com'}";
        final String response = "{'jsonrpc':'2.0','id':null,'result':[{'ns1.google.com':'216.239.32.10'}]}";
        stubRequest(request, response, HttpStatus.OK);

        final ResponseEntity<String> statusResponse = dnsCheckerController.status("ns1.google.com");

        assertThat(statusResponse.getStatusCode(), is(HttpStatus.OK));
        assertThat(statusResponse.getBody(), isEmptyOrNullString());
    }

    @Test
    public void itShouldReturnNotFoundWhenNsIsIncorrect() {

        final String request = "{'method': 'get_ns_ips', 'params': 'ns1.crazy-eight.com'}";
        final String response = "{'jsonrpc':'2.0','id':null,'result':[{'ns1.crazy-eight.com':'0.0.0.0'}]}";
        stubRequest(request, response, HttpStatus.OK);

        final ResponseEntity<String> statusResponse = dnsCheckerController.status("ns1.crazy-eight.com");

        assertThat(statusResponse.getStatusCode(), is(HttpStatus.NOT_FOUND));
        assertThat(statusResponse.getBody(), isEmptyOrNullString());
    }

    private void stubRequest(final String requestBody, final String responseBody, final HttpStatus httpStatus) {
        stubFor((post(urlEqualTo("/")).withRequestBody(equalToJson(requestBody))
            .willReturn(
                aResponse()
                    .withStatus(httpStatus.value())
                    .withBody(responseBody))));
    }

}
