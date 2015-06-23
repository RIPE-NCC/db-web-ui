package net.ripe.whois.services;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import net.ripe.db.whois.api.rest.client.RestClientException;
import org.junit.Rule;
import org.junit.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.getRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.matching;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;


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
    public static final String URL = "/api/user/" + USER_UUID + "/maintainers?apiKey=" + API_KEY;

    @Rule
    public WireMockRule wireMockRule = new WireMockRule(8089);

    private final WhoisInternalService whoisInternalService = new WhoisInternalService(MOCK_WHOIS_INTERNAL_URL, API_KEY);

    @Test
    public void shouldFetchMantainersForCookieWithXm() {

        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.OK.value())
                .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                .withBody(VALID_XML_RESPONSE)));

        whoisInternalService.getMaintainers(USER_UUID);

        verify(getRequestedFor(urlEqualTo(URL))
            .withHeader("Accept", matching("application/xml"))
            .withQueryParam("apiKey", matching("DB-WHOIS-d5395e7fbf8d")));
    }

    @Test
    public void shouldReturnSuccessResponse() {
        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.OK.value())
                .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                .withBody(VALID_XML_RESPONSE)));

        List<Map<String, Object>> response = whoisInternalService.getMaintainers(USER_UUID);

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
        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.NOT_FOUND.value())
                .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                .withBody(ERROR_XML_RESPONSE)));
        try {
            whoisInternalService.getMaintainers(USER_UUID);
            fail("Should not be reached");
        } catch (RestClientException exc) {
            assertEquals(1, exc.getErrorMessages().size());
            assertEquals("Error", exc.getErrorMessages().get(0).getSeverity());
        }
    }
}
