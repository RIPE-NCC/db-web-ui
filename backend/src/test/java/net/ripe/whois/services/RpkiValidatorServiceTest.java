
package net.ripe.whois.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class RpkiValidatorServiceTest {

    private final RestTemplate restTemplate = new RestTemplate();

    private final String MOCK_URL = "http://localhost:8090/api/v1/validity/";

    private final RpkiValidatorService rpkiValidatorService = new RpkiValidatorService(restTemplate, MOCK_URL);

    private MockRestServiceServer mockServer;

    @BeforeEach
    public void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void roa_validity() {
        final String origin = "origin";
        final String route = "route";
        String MOCK_RESPONSE = "{response: ok}";

        mockServer.expect(requestTo(MOCK_URL + origin + "/" + route)).andRespond(withSuccess(MOCK_RESPONSE, MediaType.APPLICATION_JSON));
        String response = rpkiValidatorService.getRoaValidity(origin, route);
        assertEquals(response, MOCK_RESPONSE);
    }
}
