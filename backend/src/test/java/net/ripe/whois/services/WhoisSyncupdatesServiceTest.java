package net.ripe.whois.services;

import net.ripe.whois.SsoTokenFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class WhoisSyncupdatesServiceTest {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String MOCK_SYNCUPDATE_URL = "http://localhost:8090";

    private WhoisSyncupdatesService whoisSyncupdatesService = new WhoisSyncupdatesService(restTemplate, MOCK_SYNCUPDATE_URL);

    private MockRestServiceServer mockServer;

    private HttpHeaders httpHeaders;

    final String rpslObject =
            "inetnum:         192.0.2.0 - 192.0.2.255\n" +
            "netname:         test-netname\n" +
            "country:         NL\n" +
            "org:             ORG-TST3-RIPE\n" +
            "admin-c:         TSTTECHC-RIPE\n" +
            "tech-c:          TSTTECHC-RIPE\n" +
            "descr:           testing\n" +
            "status:          ALLOCATED PA\n" +
            "mnt-by:          ripe-ncc-hm-mnt\n" +
            "mnt-by:          TST02-MNT\n" +
            "created:         2016-04-25T12:53:03Z\n" +
            "last-modified:   2017-09-20T07:51:01Z\n" +
            "source:          RIPE";

    @BeforeEach
    public void setUp() throws Exception {
        mockServer = MockRestServiceServer.createServer(restTemplate);
        httpHeaders = new HttpHeaders();
    }

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
        String respons = whoisSyncupdatesService.proxy("something", httpHeaders).toString();
        assertTrue(respons.contains(expectedResponse));
    }

    @Test
    public void shouldReturnErrorAuthorisedMessage() {
        final String expectedResponse =
                "***Error:   Authorisation for [inetnum] 192.0.2.0 - 192.0.2.255 failed\n" +
                "            using \"mnt-by:\"\n" +
                "            not authenticated by: RIPE-NCC-HM-MNT, TST02-MNT";
        mockServer.expect(requestTo(MOCK_SYNCUPDATE_URL))
                .andRespond(withSuccess(expectedResponse, MediaType.APPLICATION_FORM_URLENCODED));
        String respons = whoisSyncupdatesService.proxy(rpslObject, httpHeaders).toString();
        assertTrue(respons.contains(expectedResponse));
    }

    @Test
    public void shouldReturnSuccessMessage() {
        final String expectedResponse =
                "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" +
                "The following object(s) were processed SUCCESSFULLY:\n" +
                "\n" +
                "---\n" +
                "No operation: [inetnum] 192.0.2.0 - 192.0.2.255\n" +
                "\n" +
                "\n" +
                "***Warning: Submitted object identical to database object";
        mockServer.expect(requestTo(MOCK_SYNCUPDATE_URL))
                .andRespond(withSuccess(expectedResponse, MediaType.APPLICATION_FORM_URLENCODED));
        String respons = whoisSyncupdatesService.proxy(rpslObject.concat("password:TST02-MNT"), httpHeaders).toString();
        assertTrue(respons.contains(expectedResponse));
    }

    @Test
    public void shouldForLoggedInMntReturnSuccessMessage() {
        httpHeaders.add("Cookie", "pref-ui-mode=textupdates; _ga=GA1.3.1221467399.1496843568; " +
                "pref-syncupdates-mode=rich; uslk_e=MjFiZjlkMWYtYTE1Mi1hNmFiLWZmOGUtMDFkNTYyYWRiMzIz~~~~~~~2~; " +
                "activeMembershipId=org%3AORG-TEST1234-RIPE; cookies-accepted=accepted; " + SsoTokenFilter.SSO_TOKEN_KEY + "=u00dCkpOmYzHek0GegdqFA00; " +
                "crowd.ripe.hint=true; uslk_s=Idle%3B0~~0~0~0~~\n");

        final String rpslObjectIsvMnt =
                "organisation:    ORG-TEST1234-RIPE\n" +
                "org-name:        Shw\n" +
                "org-type:        OTHER\n" +
                "address:         Amsterdam\n" +
                "e-mail:          ivana.svonja@ripe.net\n" +
                "abuse-c:         TEST93-RIPE\n" +
                "mnt-ref:         TEST35-MNT\n" +
                "mnt-by:          isvonja-mnt\n" +
                "mnt-by:          TEST35-MNT\n" +
                "created:         2017-01-27T07:20:46Z\n" +
                "last-modified:   2017-10-10T12:00:28Z\n" +
                "source:          RIPE";

        final String expectedResponse =
                "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" +
                "The following object(s) were processed SUCCESSFULLY:\n" +
                "\n" +
                "---\n" +
                "No operation: [organisation] ORG-TEST1234-RIPE\n" +
                "\n" +
                "\n" +
                "***Warning: Submitted object identical to database object\n" +
                "\n" +
                "\n" +
                "\n" +
                "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~";
        mockServer.expect(requestTo(MOCK_SYNCUPDATE_URL))
                .andRespond(withSuccess(expectedResponse, MediaType.APPLICATION_FORM_URLENCODED));
        String respons = whoisSyncupdatesService.proxy(rpslObjectIsvMnt, httpHeaders).toString();
        assertTrue(respons.contains(expectedResponse));
    }

}
