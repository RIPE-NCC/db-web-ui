package net.ripe.whois.services;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static net.ripe.whois.services.WhoisInternalResourcesService.IPV4_RESOURCES_PATH;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class WhoisInternalResourcesServiceTest {

    private static final String MOCK_HOST = "http://int-dev.db.ripe.net";

    private static final String API_KEY = "DB-WHOIS-fe91223ec3a27c24";

    private static final String ORG_ID = "ORG-IOB1-RIPE";

    private static final String VALID_JSON_RESPONSE = "{\"headers\":{\"Date\":[\"Mon, 20 Feb 2017 13:09:44 GMT\"],\"Server\":[\"Jetty(9.3.z-SNAPSHOT)\"],\"Content-Type\":[\"application/json\"],\"Cache-Control\":[\"no-cache, no-store, must-revalidate\"],\"Pragma\":[\"no-cache\"],\"Expires\":[\"0\"],\"Content-Length\":[\"454\"],\"Keep-Alive\":[\"timeout=10, max=100\"],\"Connection\":[\"Keep-Alive\"]},\"body\":\"{\\\"orgid\\\":\\\"ORG-IOB1-RIPE\\\",\\\"details\\\":[{\\\"range\\\":{\\\"string\\\":\\\"62.221.192.0 - 62.221.255.255\\\",\\\"slash\\\":\\\"62.221.192.0/18\\\",\\\"start\\\":1054720000,\\\"end\\\":1054736383},\\\"status\\\":\\\"ALLOCATED PA\\\"},{\\\"range\\\":{\\\"string\\\":\\\"94.126.32.0 - 94.126.39.255\\\",\\\"slash\\\":\\\"94.126.32.0/21\\\",\\\"start\\\":1585324032,\\\"end\\\":1585326079},\\\"status\\\":\\\"ALLOCATED PA\\\"},{\\\"range\\\":{\\\"string\\\":\\\"185.115.144.0 - 185.115.147.255\\\",\\\"slash\\\":\\\"185.115.144.0/22\\\",\\\"start\\\":3111358464,\\\"end\\\":3111359487},\\\"status\\\":\\\"ALLOCATED PA\\\"}]}\",\"statusCode\":\"OK\",\"statusCodeValue\":200}";

    private final RestTemplate restTemplate = new RestTemplate();

    private final WhoisInternalResourcesService whoisInternalResourcesService = new WhoisInternalResourcesService(restTemplate, MOCK_HOST, API_KEY, "/");

    private MockRestServiceServer mockServer;

    public String testURL(String orgId) {
        return String.format("%s/%s/%s.json?apiKey=%s", MOCK_HOST, IPV4_RESOURCES_PATH, orgId, API_KEY);
    }

    @Before
    public void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void shouldReturnSuccessResponse() {

        mockServer.expect(requestTo(testURL(ORG_ID))).andRespond(withSuccess(VALID_JSON_RESPONSE, MediaType.APPLICATION_JSON));

        ResponseEntity response = whoisInternalResourcesService.getIpv4Resources(ORG_ID);

        mockServer.verify();
    }
}
