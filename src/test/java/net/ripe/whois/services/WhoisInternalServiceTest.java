package net.ripe.whois.services;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import org.junit.Rule;
import org.junit.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.Assert.assertEquals;


public class WhoisInternalServiceTest {

    private static final String VALID_JSON_RESPONSE = "{\"objects\":{\"object\":[{\"type\":\"mntner\",\"link\":{\"type\":\"locator\",\"href\":\"https://rest-dev.db.ripe.net/ripe/mntner/THIAGO-MNT\"},\"source\":{\"id\":\"ripe\"},\"primary-key\":{\"attribute\":[{\"name\":\"mntner\",\"value\":\"THIAGO-MNT\"}]},\"attributes\":{\"attribute\":[{\"name\":\"mntner\",\"value\":\"THIAGO-MNT\"},{\"name\":\"descr\",\"value\":\"skjdhfsjkdl\"},{\"name\":\"admin-c\",\"value\":\"DW-RIPE\"},{\"name\":\"auth\",\"value\":\"SSO\",\"comment\":\"Filtered\"},{\"name\":\"mnt-by\",\"value\":\"THIAGO-MNT\"},{\"name\":\"created\",\"value\":\"2015-05-29T09:11:39Z\"},{\"name\":\"last-modified\",\"value\":\"2015-05-29T09:11:39Z\"},{\"name\":\"source\",\"value\":\"RIPE\",\"comment\":\"Filtered\"}]}}]}}";
    private static final String VALID_XML_RESPONSE ="<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\"><objects><object type=\"mntner\"><link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/GROL2-MNT\"/><source id=\"ripe\"/><primary-key><attribute name=\"mntner\" value=\"GROL2-MNT\"/></primary-key><attributes><attribute name=\"mntner\" value=\"GROL2-MNT\"/><attribute name=\"descr\" value=\"My desc\"/><attribute name=\"admin-c\" value=\"DW-RIPE\"/><attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/><attribute name=\"mnt-by\" value=\"GROLSSO-MNT\"/><attribute name=\"created\" value=\"2015-06-03T10:39:21Z\"/><attribute name=\"last-modified\" value=\"2015-06-03T10:39:21Z\"/><attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/></attributes></object><object type=\"mntner\"><link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/GROLSSO-MNT\"/><source id=\"ripe\"/><primary-key><attribute name=\"mntner\" value=\"GROLSSO-MNT\"/></primary-key><attributes><attribute name=\"mntner\" value=\"GROLSSO-MNT\"/><attribute name=\"descr\" value=\"My Descr again\"/><attribute name=\"admin-c\" value=\"DW-RIPE\"/><attribute name=\"auth\" value=\"MD5-PW\" comment=\"Filtered\"/><attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/><attribute name=\"mnt-by\" value=\"GROLSSO-MNT\"/><attribute name=\"created\" value=\"2015-05-26T15:30:45Z\"/><attribute name=\"last-modified\" value=\"2015-05-28T14:50:01Z\"/><attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/></attributes></object><object type=\"mntner\"><link xlink:type=\"locator\" xlink:href=\"https://rest-dev.db.ripe.net/ripe/mntner/GROLLO-MNT\"/><source id=\"ripe\"/><primary-key><attribute name=\"mntner\" value=\"GROLLO-MNT\"/></primary-key><attributes><attribute name=\"mntner\" value=\"GROLLO-MNT\"/><attribute name=\"descr\" value=\"My desc\"/><attribute name=\"admin-c\" value=\"DW-RIPE\"/><attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/><attribute name=\"mnt-by\" value=\"GROL2-MNT\"/><attribute name=\"created\" value=\"2015-06-10T12:07:57Z\"/><attribute name=\"last-modified\" value=\"2015-06-10T12:11:37Z\"/><attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/></attributes></object></objects></whois-resources>";
    private static final String VALID_COMPACT_JSON_RESPONSE = "[{\"mine\":true,\"type\":\"mntner\",\"auth\":[\"SSO\"],\"key\":\"GROL2-MNT\"},{\"mine\":true,\"type\":\"mntner\",\"auth\":[\"MD5-PW\",\"SSO\"],\"key\":\"GROLSSO-MNT\"},{\"mine\":true,\"type\":\"mntner\",\"auth\":[\"SSO\"],\"key\":\"GROLLO-MNT\"}]";
    private static final String MOCK_WHOIS_INTERNAL_URL = "http://localhost:8089";
    private static final UUID USER_UUID = UUID.randomUUID();
    private static final String API_KEY = "DB-WHOIS-d5395e7fbf8d";
    public static final String URL = "/api/user/" + USER_UUID + "/maintainers?apiKey=" + API_KEY;

    @Rule
    public WireMockRule wireMockRule = new WireMockRule(8089);

    private final WhoisInternalService whoisInternalService = new WhoisInternalService(MOCK_WHOIS_INTERNAL_URL, API_KEY);

    @Test
    public void shouldSendRequestToGetMaintainersWithJsonContentType() {

        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.OK.value())
                .withBody(VALID_JSON_RESPONSE)));

        whoisInternalService.getMaintainers(USER_UUID);

        verify(getRequestedFor(urlEqualTo(URL))
            .withHeader("Content-Type", matching("application/json")));

    }

    @Test
    public void shouldReturnTheRawResponse() {
        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.OK.value())
                .withBody(VALID_JSON_RESPONSE)));

        ResponseEntity<String> response = whoisInternalService.getMaintainers(USER_UUID);

        assertEquals(VALID_JSON_RESPONSE, response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    public void shouldSendRequestToGetMaintainersCompactWithJsonContentType() {

        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.OK.value())
                .withHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_XML_VALUE)
                .withBody(VALID_XML_RESPONSE)));

        whoisInternalService.getMaintainersCompact(USER_UUID);

        verify(getRequestedFor(urlEqualTo(URL))
            .withHeader("Content-Type", matching("application/xml")));

    }

    @Test
    public void shouldReturnTheCompactResponse() {
        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.OK.value())
                .withHeader(HttpHeaders.CONTENT_TYPE,MediaType.APPLICATION_XML_VALUE)
                .withBody(VALID_XML_RESPONSE)));

        ResponseEntity<String> response = whoisInternalService.getMaintainersCompact(USER_UUID);

        assertEquals(VALID_COMPACT_JSON_RESPONSE, response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }
}
