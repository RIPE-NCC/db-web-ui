package net.ripe.whois.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class RsngServiceTest {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String MOCK_BA_APPS_URL = "http://localhost:8090";

    private RsngService rsngService = new RsngService(restTemplate, MOCK_BA_APPS_URL, "APIKEY-BAAPPS");

    private MockRestServiceServer mockServer;

    @BeforeEach
    public void setUp() throws Exception {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void findTicketsForAGivenMember() {
        long orgId = 12345L;
        String json = "{\"tickets\":{\"192.0.2.0/20\":[{\"number\":\"NCC#201001020304\",\"date\":\"2008-09-15\",\"resource\":\"192.0.2.0/21\"}]}}";
        mockServer.expect(requestTo(MOCK_BA_APPS_URL + "/resource-services/member-resources/"+orgId)).andRespond(withSuccess(json, MediaType.APPLICATION_JSON));
        assertEquals(json, rsngService.getResourceTickets(orgId));
    }
}
