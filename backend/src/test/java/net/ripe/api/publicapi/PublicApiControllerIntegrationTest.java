package net.ripe.api.publicapi;

import net.ripe.whois.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;

public class PublicApiControllerIntegrationTest extends AbstractIntegrationTest {

    @Test
    public void read_ipanalyser_ipv6() {
        mock("/public/ipanalyser/v2/ipv6?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            "{\n" +
                "  \"allocationsByRIR\": [\n" +
                "    {\n" +
                "      \"range\": \"2a04:9ec0::\\/29\",\n" +
                "      \"netname\": \"NET4\",\n" +
                "      \"registrationDate\": 1127302081000,\n" +
                "      \"allocationsByLIR\": [\n" +
                "        {\n" +
                "          \"range\": \"2a04:9ec0:4::\\/48\",\n" +
                "          \"netname\": \"NET4\",\n" +
                "          \"registrationDate\": 1127302081000\n" +
                "        }\n" +
                "      ]\n" +
                "    }\n" +
                "  ]\n" +
                "}\n");

        final ResponseEntity<String> response = get("/api/ipanalyser/v2/ipv6?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("allocationsByRIR"));
    }

    @Test
    public void read_ipanalyser_ipv4() {
        mock("/public/ipanalyser/v2/ipv4?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            "{\n" +
                "  \"allocations\": [\n" +
                "    {\n" +
                "      \"status\": \"ALLOCATED PA\",\n" +
                "      \"assignments\": [\n" +
                "        {\n" +
                "          \"status\": \"ASSIGNED PA\",\n" +
                "          \"netName\": \"NET4\",\n" +
                "          \"registrationDate\": \"20050921\",\n" +
                "          \"infra\": false,\n" +
                "          \"range\": \"13.0.0.0/24\"\n" +
                "        }\n" +
                "      ],\n" +
                "      \"range\": \"13.0.0.0/8\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"errors\": [],\n" +
                "  \"freeSpace\": [\n" +
                "  ]\n" +
                "}");

        final ResponseEntity<String> response = get("/api/ipanalyser/v2/ipv4?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("allocations"));
    }

    @Test
    public void read_myresources_allResources() {
        mock("/public/myResources/v2/allResources?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            getResourcesMock());

        final ResponseEntity<String> response = get("/api/myResources/v2/allResources?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("asnResources"));
    }

    @Test
    public void read_myresources_asns() {
        mock("/public/myResources/v2/asns?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            getResourcesMock());

        final ResponseEntity<String> response = get("/api/myResources/v2/asns?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("asnResources"));
    }

    @Test
    public void read_myresources_ipv4() {
        mock("/public/myResources/v2/ipv4?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            getResourcesMock());

        final ResponseEntity<String> response = get("/api/myResources/v2/ipv4?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("ipv4Assignments"));
    }

    @Test
    public void read_myresources_ipv6() {
        mock("/public/myResources/v2/ipv6?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            getResourcesMock());

        final ResponseEntity<String> response = get("/api/myResources/v2/ipv6?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("ipv6Assignments"));
    }

    @Test
    public void read_myresources_ipv6_allocations() {
        mock("/public/myResources/v2/ipv6/allocations?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            getResourcesMock());

        final ResponseEntity<String> response = get("/api/myResources/v2/ipv6/allocations?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("ipv6Allocations"));
    }

    @Test
    public void read_myresources_ipv4_allocations() {
        mock("/public/myResources/v2/ipv4/allocations?clientIp=127.0.0.1&org-id=ORG-LIR1-TEST",
            getResourcesMock());

        final ResponseEntity<String> response = get("/api/myResources/v2/ipv4/allocations?org-id=ORG-LIR1-TEST", String.class, getHeaders());

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("ipv4Allocations"));
    }


    //helper methods

    private HttpEntity entity(Object body) {
        return new HttpEntity(body);
    }

    private HttpEntity<HttpHeaders> getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json");
        headers.set("Authorization", "Bearer " + " test");
        return new HttpEntity<>(headers);
    }

    private String getResourcesMock() {
        return "{\n" +
            "  \"asnResources\": [\n" +
            "    {\n" +
            "      \"independentResourceStatus\": \"LIR Customer, Documents Approved\",\n" +
            "      \"number\": \"679\",\n" +
            "      \"organisation\": {\n" +
            "        \"name\": \"Test Whiskey\"\n" +
            "      },\n" +
            "      \"peersQueryUrl\": \"https://stat.ripe.net/widget/asn-neighbours-history#w[resource]=AS679\",\n" +
            "      \"registrationDate\": \"1993-09-01\",\n" +
            "      \"ticket\": {\n" +
            "        \"showTicketUrl\": \"https://www.ripe.net/cgi-bin/rttquery?ticnum=20150310234\",\n" +
            "        \"ticketNumber\": \"NCC#20150310234\"\n" +
            "      },\n" +
            "      \"whoisQueryUrl\": \"https://localhost/TEST/aut-num/AS679.json\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"ipv4Allocations\": [\n" +
            "    {\n" +
            "      \"prefix\": \"78.104.0.0/16\",\n" +
            "      \"registrationDate\": \"2007-06-07\",\n" +
            "      \"size\": 65536,\n" +
            "      \"status\": \"ALLOCATED_PA\",\n" +
            "      \"ticket\": {\n" +
            "        \"showTicketUrl\": \"https://www.ripe.net/cgi-bin/rttquery?ticnum=2006020733\",\n" +
            "        \"ticketNumber\": \"NCC#2006020733\"\n" +
            "      },\n" +
            "      \"whoisQueryUrl\": \"https://localhost/TEST/inetnum/78.104.0.0/16.json\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"ipv4Assignments\": [\n" +
            "    {\n" +
            "      \"independentResourceStatus\": \"LIR Customer, Documents Approved\",\n" +
            "      \"organisationName\": \"Test Lima\",\n" +
            "      \"prefix\": \"194.29.99.0/24\",\n" +
            "      \"registrationDate\": \"1999-10-18\",\n" +
            "      \"ticket\": {\n" +
            "        \"showTicketUrl\": \"https://www.ripe.net/cgi-bin/rttquery?ticnum=1999097731\",\n" +
            "        \"ticketNumber\": \"NCC#1999097731\"\n" +
            "      },\n" +
            "      \"type\": null,\n" +
            "      \"whoisQueryUrl\": \"https://localhost/TEST/inetnum/194.29.99.0/24.json\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"ipv6Allocations\": [\n" +
            "    {\n" +
            "      \"prefix\": \"2001:628::/29\",\n" +
            "      \"registrationDate\": \"1999-09-20\",\n" +
            "      \"ticket\": {\n" +
            "        \"showTicketUrl\": \"https://www.ripe.net/cgi-bin/rttquery?ticnum=1999074361\",\n" +
            "        \"ticketNumber\": \"NCC#1999074361\"\n" +
            "      },\n" +
            "      \"whoisQueryUrl\": \"https://localhost/TEST/inet6num/2001:628::/29.json\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"ipv6Assignments\": [\n" +
            "    {\n" +
            "      \"independentResourceStatus\": \"LIR Customer, Documents Approved\",\n" +
            "      \"organisationName\": \"Test Mike\",\n" +
            "      \"prefix\": \"2001:67c:1280::/48\",\n" +
            "      \"registrationDate\": \"2012-09-21\",\n" +
            "      \"ticket\": {\n" +
            "        \"showTicketUrl\": \"https://www.ripe.net/cgi-bin/rttquery?ticnum=2012093871\",\n" +
            "        \"ticketNumber\": \"NCC#2012093871\"\n" +
            "      },\n" +
            "      \"type\": \"PI\",\n" +
            "      \"whoisQueryUrl\": \"https://localhost/TEST/inet6num/2001:67c:1280::/48.json\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"regid\": \"some.lir\"\n" +
            "}";
    }

}
