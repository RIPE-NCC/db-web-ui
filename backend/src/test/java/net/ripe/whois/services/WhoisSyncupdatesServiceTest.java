package net.ripe.whois.services;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class WhoisSyncupdatesServiceTest {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String MOCK_SYNCUPDATE_URL = "http://localhost:8090";

    private WhoisSyncupdatesService whoisSyncupdatesService = new WhoisSyncupdatesService(restTemplate, MOCK_SYNCUPDATE_URL);

    private MockRestServiceServer mockServer;

    final String rpslObject =
            "inetnum:         3.0.103.0 - 3.0.103.255\n" +
            "netname:         test-netname\n" +
            "country:         NL\n" +
            "org:             ORG-EIP1-RIPE\n" +
            "admin-c:         inty1-ripe\n" +
            "tech-c:          inty1-ripe\n" +
            "descr:           testing\n" +
            "status:          ALLOCATED PA\n" +
            "mnt-by:          ripe-ncc-hm-mnt\n" +
            "mnt-by:          TPOLYCHNIA-MNT\n" +
            "created:         2016-04-25T12:53:03Z\n" +
            "last-modified:   2017-09-20T07:51:01Z\n" +
            "source:          RIPE";

    @Before
    public void setUp() throws Exception {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    private final static String crowdToken = "snfkvjnfkjvnsdnc";

    @Test
    public void shouldReturnNotProcessedMessage() {
        final String expectedResponse =
                "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" +
                "The following paragraph(s) do not look like objects\n" +
                "and were NOT PROCESSED:\n" +
                "\n" +
                "something\n" +
                "\n" +
                "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n";

        mockServer.expect(requestTo(MOCK_SYNCUPDATE_URL))
                .andRespond(withSuccess(expectedResponse, MediaType.APPLICATION_FORM_URLENCODED));
        String respons = whoisSyncupdatesService.update("something").toString();
        assertTrue(respons.contains(expectedResponse));
    }

    @Test
    public void shouldReturnErrorAuthorisedMessage() {
        final String expectedResponse =
                "***Error:   Authorisation for [inetnum] 3.0.103.0 - 3.0.103.255 failed\n" +
                "            using \"mnt-by:\"\n" +
                "            not authenticated by: RIPE-NCC-HM-MNT, TPOLYCHNIA-MNT";
        mockServer.expect(requestTo(MOCK_SYNCUPDATE_URL))
                .andRespond(withSuccess(expectedResponse, MediaType.APPLICATION_FORM_URLENCODED));
        String respons = whoisSyncupdatesService.update(rpslObject).toString();
        assertTrue(respons.contains(expectedResponse));
    }

    @Test
    public void shouldReturnSuccessMessage() {
        final String expectedResponse =
                "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" +
                "The following object(s) were processed SUCCESSFULLY:\n" +
                "\n" +
                "---\n" +
                "No operation: [inetnum] 3.0.103.0 - 3.0.103.255\n" +
                "\n" +
                "\n" +
                "***Warning: Submitted object identical to database object";
        mockServer.expect(requestTo(MOCK_SYNCUPDATE_URL))
                .andRespond(withSuccess(expectedResponse, MediaType.APPLICATION_FORM_URLENCODED));
        String respons = whoisSyncupdatesService.update(rpslObject.concat("password:TPOLYCHNIA-MNT")).toString();
        assertTrue(respons.contains(expectedResponse));
    }

}
