package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.client.RestClientException;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.Assert.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class BaAppsServiceTest {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String MOCK_BA_APPS_URL = "http://localhost:8090";

    private BaAppsService baAppsService = new BaAppsService(restTemplate, MOCK_BA_APPS_URL, "APIKEY-BAAPPS");

    private MockRestServiceServer mockServer;

    @Before
    public void setUp() throws Exception {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void findTicketsForAGivenMember() {
        long orgId = 12345L;
        String json = "{\"tickets\":{\"94.126.32.0/20\":[{\"number\":\"NCC#201001020304\",\"date\":\"2008-09-15\",\"resource\":\"94.126.32.0/21\"}]}}";
        mockServer.expect(requestTo(MOCK_BA_APPS_URL + "/resource-services/member-resources/"+orgId+"?api-key=APIKEY-BAAPPS")).andRespond(withSuccess(json, MediaType.APPLICATION_JSON));
        assertEquals(json, baAppsService.getResourceTickets(orgId));
    }
}
