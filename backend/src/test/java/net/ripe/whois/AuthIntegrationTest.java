package net.ripe.whois;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.ws.rs.core.MediaType;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;


public class AuthIntegrationTest extends AbstractIntegrationTest {


    private static final String RESOURCES_MOCK = "{\n" +
            "  \"response\":{\n" +
            "    \"status\":200,\n" +
            "    \"message\":\"OK\",\n" +
            "    \"totalSize\":1,\n" +
            "    \"links\":[\n" +
            "      {\n" +
            "        \"rel\":\"self\",\n" +
            "        \"href\":\"/resource-services/member-resources/7347?api-key=BAD-RPKI-TEST\"\n" +
            "      }\n" +
            "    ],\n" +
            "    \"content\":{\n" +
            "      \"membershipId\":7347,\n" +
            "      \"recievedLast22\":false,\n" +
            "      \"asns\":[\n" +
            "        \n" +
            "      ],\n" +
            "      \"ipv4Allocations\":[\n" +
            "        {\n" +
            "          \"resource\":\"192.0.0.0/21\",\n" +
            "          \"version\":4,\n" +
            "          \"registrationDate\":\"2008-09-15\",\n" +
            "          \"actor\":\"katie\",\n" +
            "          \"ticketNumber\":\"NCC#201001020304\",\n" +
            "          \"resourceStatus\":\"ALLOCATED\",\n" +
            "          \"countryCode\":\"DK\",\n" +
            "          \"allocationType\":\"PA\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"caName\":\"7347\",\n" +
            "          \"flags\":[\n" +
            "            \n" +
            "          ]\n" +
            "        }\n" +
            "      ],\n" +
            "      \"ipv4Assignments\":[\n" +
            "        \n" +
            "      ],\n" +
            "      \"ipv4ErxResources\":[\n" +
            "        \n" +
            "      ],\n" +
            "      \"ipv6Allocations\":[\n" +
            "        \n" +
            "      ],\n" +
            "      \"ipv6Assignments\":[\n" +
            "        {\n" +
            "          \"resource\":\"2001:7fc:2::/48\",\n" +
            "          \"version\":0,\n" +
            "          \"registrationDate\":\"2017-06-13\",\n" +
            "          \"actor\":\"ba-rs\",\n" +
            "          \"ticketNumber\":\"NCC#2017068683\",\n" +
            "          \"organisationName\":\"Internet Provider Test\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497304800000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AF\",\n" +
            "          \"organisationObjectId\":\"ORG-TST3-RIPE\",\n" +
            "          \"assignmentType\":\"TEMPORARY\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"caName\":\"ORG-TST3-RIPE\",\n" +
            "          \"inSyncWithRipeDb\":true,\n" +
            "          \"flags\":[\n" +
            "            \n" +
            "          ]\n" +
            "        },\n" +
            "        {\n" +
            "          \"resource\":\"2001:7fc:4::/48\",\n" +
            "          \"version\":0,\n" +
            "          \"registrationDate\":\"2017-06-13\",\n" +
            "          \"actor\":\"ba-rs\",\n" +
            "          \"ticketNumber\":\"NCC#2017068687\",\n" +
            "          \"organisationName\":\"Internet Provider Test\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497304800000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AS\",\n" +
            "          \"organisationObjectId\":\"ORG-TST3-RIPE\",\n" +
            "          \"assignmentType\":\"TEMPORARY\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"caName\":\"ORG-TST3-RIPE\",\n" +
            "          \"inSyncWithRipeDb\":true,\n" +
            "          \"flags\":[\n" +
            "            \n" +
            "          ]\n" +
            "        },\n" +
            "        {\n" +
            "          \"resource\":\"2001:7fc:5::/48\",\n" +
            "          \"version\":0,\n" +
            "          \"registrationDate\":\"2017-06-14\",\n" +
            "          \"actor\":\"ba-rs\",\n" +
            "          \"ticketNumber\":\"NCC#2017068691\",\n" +
            "          \"organisationName\":\"Internet Provider Test\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497391200000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AX\",\n" +
            "          \"organisationObjectId\":\"ORG-TST3-RIPE\",\n" +
            "          \"assignmentType\":\"TEMPORARY\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"caName\":\"ORG-TST3-RIPE\",\n" +
            "          \"inSyncWithRipeDb\":true,\n" +
            "          \"flags\":[\n" +
            "            \n" +
            "          ]\n" +
            "        },\n" +
            "        {\n" +
            "          \"resource\":\"2001:7fc:6::/48\",\n" +
            "          \"version\":0,\n" +
            "          \"registrationDate\":\"2017-06-14\",\n" +
            "          \"actor\":\"ba-rs\",\n" +
            "          \"ticketNumber\":\"NCC#2017068693\",\n" +
            "          \"organisationName\":\"Internet Provider Test 2\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497391200000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AF\",\n" +
            "          \"organisationObjectId\":\"ORG-TST3-RIPE\",\n" +
            "          \"assignmentType\":\"TEMPORARY\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"inSyncWithRipeDb\":false,\n" +
            "          \"flags\":[\n" +
            "            \n" +
            "          ]\n" +
            "        }\n" +
            "      ]\n" +
            "    }\n" +
            "  }\n" +
            "}";

    @Test
    public void get_maintainers_success() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/api/user/7bc1fcd3-cba2-4fa1-b9d9-215caa9e3346/maintainers?clientIp=127.0.0.1",
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                        "<objects>\n" +
                        "<object type=\"mntner\">\n" +
                        "    <link xlink:type=\"locator\" xlink:href=\"http://localhost/test/mntner/TST14-RIPE\"/>\n" +
                        "    <source id=\"ripe\"/>\n" +
                        "    <primary-key>\n" +
                        "        <attribute name=\"mntner\" value=\"TST14-RIPE\"/>\n" +
                        "    </primary-key>\n" +
                        "    <attributes>\n" +
                        "        <attribute name=\"mntner\" value=\"TST14-RIPE\"/>\n" +
                        "        <attribute name=\"descr\" value=\"RIPE NCC Database Department\"/>\n" +
                        "        <attribute name=\"auth\" value=\"MD5-PW\" comment=\"Filtered\"/>\n" +
                        "        <attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>\n" +
                        "        <attribute name=\"mnt-by\" value=\"TST14-RIPE\" referenced-type=\"mntner\">\n" +
                        "            <link xlink:type=\"locator\" xlink:href=\"http://localhost/ripe/mntner/TST14-RIPE\"/>\n" +
                        "        </attribute>\n" +
                        "        <attribute name=\"created\" value=\"2013-12-10T16:55:06Z\"/>\n" +
                        "        <attribute name=\"last-modified\" value=\"2016-09-07T14:58:03Z\"/>\n" +
                        "        <attribute name=\"source\" value=\"TEST\" comment=\"Filtered\"/>\n" +
                        "    </attributes>\n" +
                        "</object>\n" +
                        "</objects>\n" +
                        "</whois-resources>", MediaType.APPLICATION_XML, HttpStatus.OK.value());

        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", CrowdTokenFilter.CROWD_TOKEN_KEY + "=" + CROWD_COOKIE_VALUE);
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/user/mntners", HttpMethod.GET, requestEntity, String.class);

        assertThat(response.getBody(), is(
                "[{" +
                        "\"mine\":true," +
                        "\"auth\":[\"MD5-PW\",\"SSO\"]," +
                        "\"type\":\"mntner\"," +
                        "\"key\":\"TST14-RIPE\"" +
                        "}]"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
    }

    @Test
    public void get_maintainers_invalid_cookie() {
        mock("/api/user/info?clientIp=127.0.0.1", "", MediaType.APPLICATION_JSON, HttpStatus.UNAUTHORIZED.value());
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", CrowdTokenFilter.CROWD_TOKEN_KEY + "=invalid");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/user/mntners",
            HttpMethod.GET,
            requestEntity,
            String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.UNAUTHORIZED));
    }

    @Test
    public void get_resource_tickets() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/resource-services/member-resources/7347", RESOURCES_MOCK);

        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", CrowdTokenFilter.CROWD_TOKEN_KEY + "=" + CROWD_COOKIE_VALUE);
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);
        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20", HttpMethod.GET, requestEntity, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is(
            "{\"tickets\":{\"192.0.0.0/20\":[{\"number\":\"NCC#201001020304\",\"date\":\"2008-09-15\",\"resource\":\"192.0.0.0/21\"}]}}"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));

    }

    @Test
    public void syncupdate_no_object() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/resource-services/member-resources/7347", RESOURCES_MOCK);

        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", CrowdTokenFilter.CROWD_TOKEN_KEY + "=aabbccdd");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);
        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20", HttpMethod.GET, requestEntity, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is(
                "{\"tickets\":{\"192.0.0.0/20\":[{\"number\":\"NCC#201001020304\",\"date\":\"2008-09-15\",\"resource\":\"192.0.0.0/21\"}]}}"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));

    }
}
