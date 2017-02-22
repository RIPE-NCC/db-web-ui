package net.ripe.whois.services;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.Assert.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class BaAppsServiceTest {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String MOCK_BA_APPS_URL = "http://localhost:8090";

    private BaAppsService baAppsService = new BaAppsService(restTemplate, MOCK_BA_APPS_URL);

    private MockRestServiceServer mockServer;

    @Before
    public void setUp() throws Exception {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void shouldReturnLirs() {
        mockServer.expect(requestTo(MOCK_BA_APPS_URL + "/api/ba-apps/lirs"))
            .andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));


    }
}
