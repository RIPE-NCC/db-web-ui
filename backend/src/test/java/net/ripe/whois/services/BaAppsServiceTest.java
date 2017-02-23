package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.client.RestClient;
import net.ripe.db.whois.api.rest.client.RestClientException;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.Assert.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
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

    private final static String crowdToken = "snfkvjnfkjvnsdnc";

    @Test
    public void shouldReturnLirsForMembers() {
        String json = checkJsonForSpecificReqType("member");
        assertEquals(json, baAppsService.getLirs(crowdToken));
    }

    @Test
    public void shouldReturnLirsForRipeDbOrgs() {
        String json = checkJsonForSpecificReqType("ripe-db-orgs");
        assertEquals(json, baAppsService.getOrganisations(crowdToken));
    }

    private String checkJsonForSpecificReqType(String type) {
        String json = "{ \"id\": \"ORG-BLA\"}";

        mockServer.expect(requestTo(MOCK_BA_APPS_URL + "/authorisation-service/v2/notification/account/" + crowdToken + "/" + type))
            .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        return json;
    }

    @Test(expected = RestClientException.class)
    public void shouldCrashToReturnLirsForMembers() {
        mockServer.expect(requestTo(MOCK_BA_APPS_URL + "/authorisation-service/v2/notification/account/" + crowdToken + "/member"))
            .andRespond(withServerError());

        baAppsService.getLirs(crowdToken);
    }
}
