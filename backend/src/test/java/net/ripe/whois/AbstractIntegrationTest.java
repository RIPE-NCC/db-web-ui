package net.ripe.whois;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.nio.charset.Charset;

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
public abstract class AbstractIntegrationTest {

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
        System.setProperty("my.resources.url", "#/myresources/overview");
        System.setProperty("lir.account.details.url", "https://my.prepdev.ripe.net/#/account-details");
        System.setProperty("lir.billing.details.url", "https://my.prepdev.ripe.net/#/billing");
        System.setProperty("lir.gm.preferences.url", "https://my.prepdev.ripe.net/#/meetings/44529bcf-7f19-4dc9-8f76-b9043a3973dd");
        System.setProperty("lir.user.accounts.url", "https://my.prepdev.ripe.net/#/contacts");
        System.setProperty("lir.tickets.url", "https://lirportal.prepdev.ripe.net/tickets/");
        System.setProperty("lir.training.url", "https://lirportal.prepdev.ripe.net/training/");
        System.setProperty("lir.api.access.keys.url", "https://lirportal.prepdev.ripe.net/api/");
        System.setProperty("ipv4.transfer.listing.service.url", "https://lirportal.prepdev.ripe.net/member-to-member/");
        System.setProperty("request.resources.url", "https://my.prepdev.ripe.net/#/request");
        System.setProperty("request.transfer.url", "https://my.prepdev.ripe.net/#/update-registry");
        System.setProperty("request.transfer.url", "https://my.prepdev.ripe.net/#/update-registry");
        System.setProperty("rpki.dashboard.url", "https://my.prepdev.ripe.net/#/rpki");
        System.setProperty("my.resources.url", "#/myresources/overview");
        System.setProperty("database.query.url", "#/query");
        System.setProperty("database.full.text.search.url", "#/fulltextsearch");
        System.setProperty("object.lookup.url", "#/lookup");
        System.setProperty("database.syncupdates.url", "#/syncupdates");
        System.setProperty("database.create.url", "#/webupdates/select");
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

    // helper methods

    protected int getLocalServerPort() {
        return this.localServerPort;
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

    public static String getResource(final String resource) {
        try {
            return Resources.toString(Resources.getResource(resource), Charsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
