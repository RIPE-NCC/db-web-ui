package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;


public class WhoisInternalServiceTest {

    private static final String VALID_XML_RESPONSE = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">" +
        "<objects>" +
        "<object type=\"mntner\">" +
        "<link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/TST18-MNT\"/><source id=\"ripe\"/>" +
        "<primary-key><attribute name=\"mntner\" value=\"TST18-MNT\"/></primary-key>" +
        "<attributes>" +
        "<attribute name=\"mntner\" value=\"TST18-MNT\"/>" +
        "<attribute name=\"descr\" value=\"My desc\"/>" +
        "<attribute name=\"admin-c\" value=\"TSTADMINC-RIPE\"/>" +
        "<attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>" +
        "<attribute name=\"mnt-by\" value=\"TSTSSO18-MNT\"/>" +
        "<attribute name=\"created\" value=\"2015-06-03T10:39:21Z\"/>" +
        "<attribute name=\"last-modified\" value=\"2015-06-03T10:39:21Z\"/>" +
        "<attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>" +
        "</attributes>" +
        "</object>" +
        "<object type=\"mntner\">" +
        "<link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/TSTSSO18-MNT\"/><source id=\"ripe\"/>" +
        "<primary-key><attribute name=\"mntner\" value=\"TSTSSO18-MNT\"/></primary-key>" +
        "<attributes>" +
        "<attribute name=\"mntner\" value=\"TSTSSO18-MNT\"/>" +
        "<attribute name=\"descr\" value=\"My Descr again\"/>" +
        "<attribute name=\"admin-c\" value=\"TSTADMINC-RIPE\"/>" +
        "<attribute name=\"auth\" value=\"MD5-PW\" comment=\"Filtered\"/>" +
        "<attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>" +
        "<attribute name=\"mnt-by\" value=\"TSTSSO18-MNT\"/>" +
        "<attribute name=\"created\" value=\"2015-05-26T15:30:45Z\"/>" +
        "<attribute name=\"last-modified\" value=\"2015-05-28T14:50:01Z\"/>" +
        "<attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>" +
        "</attributes>" +
        "</object>" +
        "<object type=\"mntner\">" +
        "<link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/TST19-MNT\"/><source id=\"ripe\"/>" +
        "<primary-key><attribute name=\"mntner\" value=\"TST19-MNT\"/></primary-key>" +
        "<attributes>" +
        "<attribute name=\"mntner\" value=\"TST19-MNT\"/>" +
        "<attribute name=\"descr\" value=\"My desc\"/>" +
        "<attribute name=\"admin-c\" value=\"TSTADMINC-RIPE\"/>" +
        "<attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>" +
        "<attribute name=\"mnt-by\" value=\"TST18-MNT\"/>" +
        "<attribute name=\"created\" value=\"2015-06-10T12:07:57Z\"/>" +
        "<attribute name=\"last-modified\" value=\"2015-06-10T12:11:37Z\"/>" +
        "<attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>" +
        "</attributes>" +
        "</object>" +
        "</objects></whois-resources>";
    private static final String ERROR_XML_RESPONSE = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
        "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
        "    <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/pez/person/TST19-RIPE\"/>\n" +
        "    <errormessages>\n" +
        "        <errormessage severity=\"Error\" text=\"Invalid x '%s'\">\n" +
        "            <args value=\"pez\"/>\n" +
        "        </errormessage>\n" +
        "    </errormessages>\n" +
        "    <terms-and-conditions xlink:type=\"locator\" xlink:href=\"http://www.ripe.net/db/support/db-terms-conditions.pdf\"/>\n" +
        "</whois-resources>";
    private static final String MOCK_WHOIS_INTERNAL_URL = "http://localhost:8089";
    private static final UUID USER_UUID = UUID.randomUUID();
    private static final String API_KEY = "DB-WHOIS-4a471957e3c7";
    public static final String URL = "/api/user/" + USER_UUID + "/maintainers";
    private static final String SSO_TOKEN = "rRrR5L8b9zksKdrl6r1zYg00";

    private final RestTemplate restTemplate = new RestTemplate();
    private final WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("");

    private final WhoisInternalService whoisInternalService = new WhoisInternalService(restTemplate, whoisInternalProxy, MOCK_WHOIS_INTERNAL_URL, API_KEY);

    private MockRestServiceServer mockServer;

    @BeforeEach
    public void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void shouldFetchMantainersForCookieWithXml() {
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + URL + "?clientIp=127.0.0.1"))
            .andRespond(withSuccess(VALID_XML_RESPONSE, MediaType.APPLICATION_XML));

        whoisInternalService.getMaintainers(USER_UUID.toString(), "127.0.0.1");

        mockServer.verify();
    }

    @Test
    public void shouldReturnSuccessResponse() {
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + URL + "?clientIp=127.0.0.1"))
                .andRespond(withSuccess(VALID_XML_RESPONSE, MediaType.APPLICATION_XML));

        List<Map<String, Object>> response = whoisInternalService.getMaintainers(USER_UUID.toString(), "127.0.0.1");

        mockServer.verify();

        assertEquals(3, response.size());
        assertEquals("mntner", response.get(0).get("type"));
        assertEquals("TST18-MNT", response.get(0).get("key"));
        assertEquals("[SSO]", response.get(0).get("auth").toString());

        assertEquals("mntner", response.get(1).get("type"));
        assertEquals("TSTSSO18-MNT", response.get(1).get("key"));
        assertEquals("[MD5-PW, SSO]", response.get(1).get("auth").toString());

        assertEquals("mntner", response.get(2).get("type"));
        assertEquals("TST19-MNT", response.get(2).get("key"));
        assertEquals("[SSO]", response.get(2).get("auth").toString());

        assertEquals(3, response.size());
    }

    @Test
    public void shouldReturnErrorResponse() {
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + URL + "?clientIp=127.0.0.1"))
                .andRespond(withStatus(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_XML).body(ERROR_XML_RESPONSE));

        try {
            whoisInternalService.getMaintainers(USER_UUID.toString(), "127.0.0.1");
            fail("Should not be reached");
        } catch (RestClientException exc) {
            assertEquals(1, exc.getErrorMessages().size());
            assertEquals("Error", exc.getErrorMessages().get(0).getSeverity());
        }
    }

    @Test
    public void shouldRetrieveUserInfo(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/info?clientIp=127.0.0.1"))
            .andRespond(withStatus(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON)
                .body(AbstractIntegrationTest.getResource("mock/user-info.json")));

        UserInfoResponse userInfoResponse = whoisInternalService.getUserInfo(SSO_TOKEN, "127.0.0.1");

        assertEquals("TSTADMINC-RIPE", userInfoResponse.user.username);
    }

    @Test
    public void shouldThrowExceptionUserInfoError(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/info?clientIp=127.0.0.1"))
            .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        try{
            whoisInternalService.getUserInfo(SSO_TOKEN, "127.0.0.1");
        }catch (RestClientException e){
            assertEquals(500, e.getStatus());
            assertEquals("Internal server error", e.getErrorMessages().stream().findFirst().get().getText());
        }
    }

    @Test
    public void shouldThrowExceptionUserInfoErrorUnAuthorized(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/info?clientIp=127.0.0.1"))
            .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        try{
            whoisInternalService.getUserInfo(SSO_TOKEN, "127.0.0.1");
        }catch (RestClientException e){
            assertEquals(401, e.getStatus());
            assertEquals("", e.getErrorMessages().stream().findFirst().get().getText());
        }
    }

    @Test
    public void shouldThrowUnauthorizedWhenCookieAbsent(){
        try {
            whoisInternalService.getUserInfo(null, "127.0.0.1");
        } catch (RestClientException e){
            assertEquals(401, e.getStatus());
        }
    }

    @Test
    public void shouldThrow503WhenWhoisInternalIsDown(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/active?clientIp=127.0.0.1"))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));
        try {
            whoisInternalService.getActiveToken(SSO_TOKEN, "127.0.0.1");
        } catch (RestClientException e){
            assertEquals(503, e.getStatus());
        }
    }

    @Test
    public void shouldReturnFalseWhenActiveTokenUnauthorized(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/active?clientIp=127.0.0.1"))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThat(whoisInternalService.getActiveToken(SSO_TOKEN, "127.0.0.1"), is(false));
    }
}
