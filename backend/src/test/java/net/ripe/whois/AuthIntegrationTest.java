package net.ripe.whois;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;


/**
 * Base integration testing class for db-web-ui.
 * <p>
 * Ref:
 * https://spring.io/blog/2016/04/15/testing-improvements-in-spring-boot-1-4
 * http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html
 */
@RunWith(SpringRunner.class)
@ActiveProfiles(profiles = "test")
@SpringBootTest(classes = {Application.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthIntegrationTest {

    protected static final String CROWD_COOKIE_NAME = "crowd.token_key";
    protected static final String CROWD_COOKIE_VALUE = "aabbccdd";
    protected static final String CROWD_SESSION_PATH = "/rest/usermanagement/1/session";
    protected static final String CROWD_USER_ATTRIBUTE_PATH = "/rest/usermanagement/1/user/attribute";

    @Autowired
    protected Environment environment;

    @Autowired
    protected ApplicationContext applicationContext;

    @Autowired
    protected TestRestTemplate restTemplate;

    @Value("${local.server.port}")
    private int localServerPort;

    protected static HttpServerMock httpServerMock;

    static {
        httpServerMock = new HttpServerMock();
        httpServerMock.start();
    }

    @BeforeClass
    public static void beforeClass() {
        System.setProperty("portal.url", getMockServerUrl());
        System.setProperty("crowd.access.url", getMockServerUrl());
        System.setProperty("crowd.login.url", getMockServerUrl());
        System.setProperty("crowd.rest.url", getMockServerUrl());
        System.setProperty("rest.api.ripeUrl", getMockServerUrl());
        System.setProperty("dns.checker.url", getMockServerUrl());
        System.setProperty("crowd.rest.user", "username");
        System.setProperty("crowd.rest.password", "password");
        System.setProperty("server.contextPath", "/db-web-ui");
        System.setProperty("internal.api.url", getMockServerUrl());
        System.setProperty("internal.api.key", "123");
        System.setProperty("ba-apps.api.key", "OMG");
        System.setProperty("ba-apps.api.url", getMockServerUrl());
        System.setProperty("syncupdates.api.url", getMockServerUrl());
        System.setProperty("rest.search.url", getMockServerUrl());
    }

    @AfterClass
    public static void afterClass() {
        httpServerMock.stop();
    }

    @Before
    public void setup() {
        mockCrowdSession();
        mockCrowdUser();
    }

    protected int getLocalServerPort() {
        return localServerPort;
    }

    protected void mock(final String uri, final String response) {
        httpServerMock.mock(uri, response);
    }

    protected static String getMockServerUrl() {
        return String.format("http://localhost:%d", httpServerMock.getPort());
    }

    protected void mockCrowdSession() {
        mock(String.format("%s/%s", CROWD_SESSION_PATH, CROWD_COOKIE_VALUE),
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                        "<session expand=\"user\">" +
                        "<token>ayGWmmTmYLZlxKY4E1U7Xw00</token>" +
                        "<user name=\"bad@ripe.net\">" +
                        "<link href=\"http://localhost/crowd/rest/usermanagement/1/user?username=bad@ripe.net\" rel=\"self\"/>" +
                        "<display-name>bad@ripe.net</display-name>" +
                        "<email>bad@ripe.net</email>" +
                        "<first-name>Bad</first-name>" +
                        "<last-name>Wolf</last-name>" +
                        "<active>true</active>" +
                        "</user>" +
                        "<created-date>2016-03-22T16:50:55.295+01:00</created-date>" +
                        "<expiry-date>2016-03-22T20:50:55.295+01:00</expiry-date>" +
                        "</session>");
    }

    protected void mockCrowdUser() {
        mock(String.format("%s", CROWD_USER_ATTRIBUTE_PATH),
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                        "<attributes>" +
                        "<attribute name=\"requiresPasswordChange\">" +
                        "\t<link href=\"http://localhost/rest/usermanagement/1/user/attribute?username=bad@ripe.net&amp;attributename=requiresPasswordChange\" rel=\"self\"/>" +
                        "\t<values><value>false</value></values>" +
                        "</attribute>" +
                        "<attribute name=\"invalidPasswordAttempts\"><values><value>0</value></values></attribute>" +
                        "<attribute name=\"passwordLastChanged\"><values><value>1454499154894</value></values></attribute>" +
                        "<attribute name=\"lastActive\"><values><value>1458661855295</value></values></attribute>" +
                        "<attribute name=\"lastAuthenticated\"><values><value>1458661855294</value></values></attribute>" +
                        "<attribute name=\"uuid\"><values><value>fd2ca42b-b997-475a-886b-ae410d1c5969</value></values></attribute>" +
                        "</attributes>");
    }

    @Test
    public void get_maintainers_success() {
        mock("/api/user/fd2ca42b-b997-475a-886b-ae410d1c5969/maintainers",
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                        "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
                        "<objects>\n" +
                        "<object type=\"mntner\">\n" +
                        "    <link xlink:type=\"locator\" xlink:href=\"http://localhost/test/mntner/BAD-MNT\"/>\n" +
                        "    <source id=\"ripe\"/>\n" +
                        "    <primary-key>\n" +
                        "        <attribute name=\"mntner\" value=\"BAD-MNT\"/>\n" +
                        "    </primary-key>\n" +
                        "    <attributes>\n" +
                        "        <attribute name=\"mntner\" value=\"BAD-MNT\"/>\n" +
                        "        <attribute name=\"descr\" value=\"RIPE NCC Database Department\"/>\n" +
                        "        <attribute name=\"auth\" value=\"MD5-PW\" comment=\"Filtered\"/>\n" +
                        "        <attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>\n" +
                        "        <attribute name=\"mnt-by\" value=\"BAD-MNT\" referenced-type=\"mntner\">\n" +
                        "            <link xlink:type=\"locator\" xlink:href=\"http://localhost/ripe/mntner/BAD-MNT\"/>\n" +
                        "        </attribute>\n" +
                        "        <attribute name=\"created\" value=\"2013-12-10T16:55:06Z\"/>\n" +
                        "        <attribute name=\"last-modified\" value=\"2016-09-07T14:58:03Z\"/>\n" +
                        "        <attribute name=\"source\" value=\"TEST\" comment=\"Filtered\"/>\n" +
                        "    </attributes>\n" +
                        "</object>\n" +
                        "</objects>\n" +
                        "</whois-resources>");

        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", "crowd.token_key=aabbccdd");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/user/mntners", HttpMethod.GET, requestEntity, String.class);

        assertThat(response.getBody(), is(
                "[{" +
                        "\"mine\":true," +
                        "\"auth\":[\"MD5-PW\",\"SSO\"]," +
                        "\"type\":\"mntner\"," +
                        "\"key\":\"BAD-MNT\"" +
                        "}]"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
    }

    @Test
    public void get_maintainers_invalid_cookie() {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", "crowd.token_key=invalid");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);

        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/user/mntners", HttpMethod.GET, requestEntity, String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.UNAUTHORIZED));
    }

    @Test
    public void get_resource_tickets() {
        mock("/authorisation-service/v2/notification/account/aabbccdd/member",LIRS_MOCK);
        mock("/resource-services/member-resources/7347", RESOURCES_MOCK);

        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", "crowd.token_key=aabbccdd");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);
        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/ba-apps/resources/ORG-EIP1-RIPE/94.126.32.0/20", HttpMethod.GET, requestEntity, String.class);
        assertThat(response.getBody(), is(
                "{\"tickets\":{\"94.126.32.0/20\":[{\"number\":\"NCC#201001020304\",\"date\":\"2008-09-15\",\"resource\":\"94.126.32.0/21\"}]}}"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));

    }

    private static String LIRS_MOCK = "{\"response\":{\"status\":200,\"message\":\"OK\",\"pageNumber\":1,\"pageSize\":1,\"pageCount\":1,\"startIndex\":1,\"totalSize\":1,\"links\":[],\"results\":[{\"membershipId\":7347,\"regId\":\"zz.example\",\"organisationname\":\"Internet Provider BV\",\"serviceLevel\":\"NORMAL\",\"orgId\":\"ORG-EIP1-RIPE\",\"billingPhase\":0},{\"membershipId\":3629,\"regId\":\"nl.surfnet\",\"organisationname\":\"SURFnet bv\",\"serviceLevel\":\"NORMAL\",\"orgId\":\"ORG-Sb3-RIPE\",\"billingPhase\":0},{\"membershipId\":2176,\"regId\":\"eu.ntteurope\",\"organisationname\":\"NTT Europe Limited\",\"serviceLevel\":\"NORMAL\",\"orgId\":\"ORG-NEL1-RIPE\",\"billingPhase\":0},{\"membershipId\":869,\"regId\":\"ch.unisource\",\"organisationname\":\"Swisscom (Switzerland) Ltd\",\"serviceLevel\":\"NORMAL\",\"orgId\":\"ORG-SI1-RIPE\",\"billingPhase\":0},{\"membershipId\":4517,\"regId\":\"at.aconet\",\"organisationname\":\"ACONET\",\"serviceLevel\":\"NORMAL\",\"orgId\":\"ORG-AA1-RIPE\",\"billingPhase\":0},{\"membershipId\":16372,\"regId\":\"nl.a2b-internet\",\"organisationname\":\"A2B IP B.V.\",\"serviceLevel\":\"NORMAL\",\"orgId\":\"ORG-AIbi1-RIPE\",\"billingPhase\":0}]}}";

    private static String RESOURCES_MOCK = "{\n" +
            "  \"response\":{\n" +
            "    \"status\":200,\n" +
            "    \"message\":\"OK\",\n" +
            "    \"totalSize\":1,\n" +
            "    \"links\":[\n" +
            "      {\n" +
            "        \"rel\":\"self\",\n" +
            "        \"href\":\"/resource-services/member-resources/7347?api-key=BAD-RPKI-NgdS7lro3hhnsEKV\"\n" +
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
            "          \"resource\":\"94.126.32.0/21\",\n" +
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
            "          \"organisationName\":\"Internet Provider BV\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497304800000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AF\",\n" +
            "          \"organisationObjectId\":\"ORG-EIP1-RIPE\",\n" +
            "          \"assignmentType\":\"TEMPORARY\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"caName\":\"ORG-EIP1-RIPE\",\n" +
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
            "          \"organisationName\":\"Internet Provider BV\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497304800000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AS\",\n" +
            "          \"organisationObjectId\":\"ORG-EIP1-RIPE\",\n" +
            "          \"assignmentType\":\"TEMPORARY\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"caName\":\"ORG-EIP1-RIPE\",\n" +
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
            "          \"organisationName\":\"Internet Provider BV\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497391200000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AX\",\n" +
            "          \"organisationObjectId\":\"ORG-EIP1-RIPE\",\n" +
            "          \"assignmentType\":\"TEMPORARY\",\n" +
            "          \"membershipId\":7347,\n" +
            "          \"caName\":\"ORG-EIP1-RIPE\",\n" +
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
            "          \"organisationName\":\"Internet Provider BV 2\",\n" +
            "          \"irStatus\":\"ENDUSER-APPROVEDDOCS\",\n" +
            "          \"irTimestamp\":1497391200000,\n" +
            "          \"resourceStatus\":\"ASSIGNED\",\n" +
            "          \"countryCode\":\"AF\",\n" +
            "          \"organisationObjectId\":\"ORG-EIP1-RIPE\",\n" +
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
    public void syncupdate_no_object() {
        mock("/authorisation-service/v2/notification/account/aabbccdd/member",LIRS_MOCK);
        mock("/resource-services/member-resources/7347", RESOURCES_MOCK);

        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", "crowd.token_key=aabbccdd");
        final HttpEntity requestEntity = new HttpEntity<>(null, requestHeaders);
        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/ba-apps/resources/ORG-EIP1-RIPE/94.126.32.0/20", HttpMethod.GET, requestEntity, String.class);
        assertThat(response.getBody(), is(
                "{\"tickets\":{\"94.126.32.0/20\":[{\"number\":\"NCC#201001020304\",\"date\":\"2008-09-15\",\"resource\":\"94.126.32.0/21\"}]}}"));
        assertThat(response.getStatusCode(), is(HttpStatus.OK));

    }
}
