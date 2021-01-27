package net.ripe.whois.services;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class WhoisInternalServiceTest {

    private static final String VALID_XML_RESPONSE = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
        "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">" +
        "<objects>" +
        "<object type=\"mntner\">" +
        "<link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/GROL2-MNT\"/><source id=\"ripe\"/>" +
        "<primary-key><attribute name=\"mntner\" value=\"GROL2-MNT\"/></primary-key>" +
        "<attributes>" +
        "<attribute name=\"mntner\" value=\"GROL2-MNT\"/>" +
        "<attribute name=\"descr\" value=\"My desc\"/>" +
        "<attribute name=\"admin-c\" value=\"DW-RIPE\"/>" +
        "<attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>" +
        "<attribute name=\"mnt-by\" value=\"GROLSSO-MNT\"/>" +
        "<attribute name=\"created\" value=\"2015-06-03T10:39:21Z\"/>" +
        "<attribute name=\"last-modified\" value=\"2015-06-03T10:39:21Z\"/>" +
        "<attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>" +
        "</attributes>" +
        "</object>" +
        "<object type=\"mntner\">" +
        "<link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/GROLSSO-MNT\"/><source id=\"ripe\"/>" +
        "<primary-key><attribute name=\"mntner\" value=\"GROLSSO-MNT\"/></primary-key>" +
        "<attributes>" +
        "<attribute name=\"mntner\" value=\"GROLSSO-MNT\"/>" +
        "<attribute name=\"descr\" value=\"My Descr again\"/>" +
        "<attribute name=\"admin-c\" value=\"DW-RIPE\"/>" +
        "<attribute name=\"auth\" value=\"MD5-PW\" comment=\"Filtered\"/>" +
        "<attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>" +
        "<attribute name=\"mnt-by\" value=\"GROLSSO-MNT\"/>" +
        "<attribute name=\"created\" value=\"2015-05-26T15:30:45Z\"/>" +
        "<attribute name=\"last-modified\" value=\"2015-05-28T14:50:01Z\"/>" +
        "<attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>" +
        "</attributes>" +
        "</object>" +
        "<object type=\"mntner\">" +
        "<link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/GROLLO-MNT\"/><source id=\"ripe\"/>" +
        "<primary-key><attribute name=\"mntner\" value=\"GROLLO-MNT\"/></primary-key>" +
        "<attributes>" +
        "<attribute name=\"mntner\" value=\"GROLLO-MNT\"/>" +
        "<attribute name=\"descr\" value=\"My desc\"/>" +
        "<attribute name=\"admin-c\" value=\"DW-RIPE\"/>" +
        "<attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>" +
        "<attribute name=\"mnt-by\" value=\"GROL2-MNT\"/>" +
        "<attribute name=\"created\" value=\"2015-06-10T12:07:57Z\"/>" +
        "<attribute name=\"last-modified\" value=\"2015-06-10T12:11:37Z\"/>" +
        "<attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>" +
        "</attributes>" +
        "</object>" +
        "</objects></whois-resources>";
    private static final String ERROR_XML_RESPONSE = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
        "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
        "    <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/pez/person/PP1-RIPE\"/>\n" +
        "    <errormessages>\n" +
        "        <errormessage severity=\"Error\" text=\"Invalid x '%s'\">\n" +
        "            <args value=\"pez\"/>\n" +
        "        </errormessage>\n" +
        "    </errormessages>\n" +
        "    <terms-and-conditions xlink:type=\"locator\" xlink:href=\"http://www.ripe.net/db/support/db-terms-conditions.pdf\"/>\n" +
        "</whois-resources>";
    private static final String MOCK_WHOIS_INTERNAL_URL = "http://localhost:8089";
    private static final UUID USER_UUID = UUID.randomUUID();
    private static final String API_KEY = "DB-WHOIS-d5395e7fbf8d";
    public static final String URL = "/api/user/" + USER_UUID + "/maintainers";
    private static final String CROWD_TOKEN = "rRrR5L8b9zksKdrl6r1zYg00";

    private final RestTemplate restTemplate = new RestTemplate();
    private final WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("");

    private final WhoisInternalService whoisInternalService = new WhoisInternalService(restTemplate, whoisInternalProxy, MOCK_WHOIS_INTERNAL_URL, API_KEY);

    private MockRestServiceServer mockServer;

    @Rule
    public ExpectedException exceptionRule = ExpectedException.none();

    @Before
    public void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void shouldFetchMantainersForCookieWithXml() {
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + URL))
            .andRespond(withSuccess(VALID_XML_RESPONSE, MediaType.APPLICATION_XML));

        whoisInternalService.getMaintainers(USER_UUID.toString());

        mockServer.verify();
    }

    @Test
    public void shouldReturnSuccessResponse() {
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + URL))
                .andRespond(withSuccess(VALID_XML_RESPONSE, MediaType.APPLICATION_XML));

        List<Map<String, Object>> response = whoisInternalService.getMaintainers(USER_UUID.toString());

        mockServer.verify();

        assertEquals(3, response.size());
        assertEquals("mntner", response.get(0).get("type"));
        assertEquals("GROL2-MNT", response.get(0).get("key"));
        assertEquals("[SSO]", response.get(0).get("auth").toString());

        assertEquals("mntner", response.get(1).get("type"));
        assertEquals("GROLSSO-MNT", response.get(1).get("key"));
        assertEquals("[MD5-PW, SSO]", response.get(1).get("auth").toString());

        assertEquals("mntner", response.get(2).get("type"));
        assertEquals("GROLLO-MNT", response.get(2).get("key"));
        assertEquals("[SSO]", response.get(2).get("auth").toString());

        assertEquals(3, response.size());
    }

    @Test
    public void shouldReturnErrorResponse() {
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + URL))
                .andRespond(withStatus(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_XML).body(ERROR_XML_RESPONSE));

        try {
            whoisInternalService.getMaintainers(USER_UUID.toString());
            fail("Should not be reached");
        } catch (RestClientException exc) {
            assertEquals(1, exc.getErrorMessages().size());
            assertEquals("Error", exc.getErrorMessages().get(0).getSeverity());
        }
    }

    @Test
    public void shouldRetrieveUserInfo(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/info"))
            .andRespond(withStatus(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON)
                .body(AbstractIntegrationTest.getResource("mock/user-info.json")));

        UserInfoResponse userInfoResponse = whoisInternalService.getUserInfo(CROWD_TOKEN);

        assertEquals("test@ripe.net", userInfoResponse.user.username);
    }

    @Test
    public void shouldThrowExceptionUserInfoError(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/info"))
            .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        try{
            whoisInternalService.getUserInfo(CROWD_TOKEN);
        }catch (RestClientException e){
            assertEquals(500, e.getStatus());
            assertEquals("Internal server error", e.getErrorMessages().stream().findFirst().get().getText());
        }
    }

    @Test
    public void shouldThrowExceptionUserInfoErrorUnAuthorized(){
        mockServer.expect(requestTo(MOCK_WHOIS_INTERNAL_URL + "/api/user/info"))
            .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        try{
            whoisInternalService.getUserInfo(CROWD_TOKEN);
        }catch (RestClientException e){
            assertEquals(401, e.getStatus());
            assertEquals("", e.getErrorMessages().stream().findFirst().get().getText());
        }
    }

    @Test
    public void shouldThrowUnauthorizedWhenCookieAbsent(){
        try {
            whoisInternalService.getUserInfo(null);
        } catch (RestClientException e){
            assertEquals(401, e.getStatus());
        }
    }

}
