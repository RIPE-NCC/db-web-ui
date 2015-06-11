package net.ripe.whois.services;

import com.github.tomakehurst.wiremock.junit.WireMockRule;
import org.junit.Rule;
import org.junit.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.Assert.assertEquals;


public class WhoisInternalServiceTest {

    private static final String VALID_RESPONSE = "{\"objects\":{\"object\":[{\"type\":\"mntner\",\"link\":{\"type\":\"locator\",\"href\":\"https://rest-dev.db.ripe.net/ripe/mntner/THIAGO-MNT\"},\"source\":{\"id\":\"ripe\"},\"primary-key\":{\"attribute\":[{\"name\":\"mntner\",\"value\":\"THIAGO-MNT\"}]},\"attributes\":{\"attribute\":[{\"name\":\"mntner\",\"value\":\"THIAGO-MNT\"},{\"name\":\"descr\",\"value\":\"skjdhfsjkdl\"},{\"name\":\"admin-c\",\"value\":\"DW-RIPE\"},{\"name\":\"auth\",\"value\":\"SSO\",\"comment\":\"Filtered\"},{\"name\":\"mnt-by\",\"value\":\"THIAGO-MNT\"},{\"name\":\"created\",\"value\":\"2015-05-29T09:11:39Z\"},{\"name\":\"last-modified\",\"value\":\"2015-05-29T09:11:39Z\"},{\"name\":\"source\",\"value\":\"RIPE\",\"comment\":\"Filtered\"}]}}]}}";
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
                .withBody(VALID_RESPONSE)));

        whoisInternalService.getMaintainers(USER_UUID);

        verify(getRequestedFor(urlEqualTo(URL))
            .withHeader("Content-Type", matching("application/json")));

    }

    @Test
    public void shouldReturnTheRawResponse() {
        stubFor(get(urlEqualTo(URL))
            .willReturn(aResponse()
                .withStatus(HttpStatus.OK.value())
                .withBody(VALID_RESPONSE)));

        ResponseEntity<String> response = whoisInternalService.getMaintainers(USER_UUID);

        assertEquals(VALID_RESPONSE, response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

}
