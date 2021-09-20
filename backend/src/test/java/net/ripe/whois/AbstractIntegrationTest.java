package net.ripe.whois;

import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;

/**
 * Base integration testing class for db-web-ui.
 * <p>
 * Ref:
 * https://spring.io/blog/2016/04/15/testing-improvements-in-spring-boot-1-4
 * http://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-testing.html
 * <p>
 * The @DirtiesContext is necessary because the Mock server is restarted and assigned a different port but the
 * Spring injection for whois api url etc is not performed between test class runs so the url and actual mock server
 * port are then out of sync. @DirtiesContext forces the context to be reinitialised, thus fixing this problem.
 */
@RunWith(SpringRunner.class)
@ActiveProfiles(profiles = "test")
@SpringBootTest(classes = {Application.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext
public abstract class AbstractIntegrationTest {

    protected static final String CROWD_COOKIE_VALUE = "aabbccdd";

    @Autowired
    protected Environment environment;

    @Autowired
    protected ApplicationContext applicationContext;

    @Autowired
    protected TestRestTemplate restTemplate;

    @Value("${local.server.port}")
    private int localServerPort;

    protected static HttpServerMock httpServerMock;

    @BeforeClass
    public static void beforeClass() {
        httpServerMock = new HttpServerMock();
        httpServerMock.start();

        System.setProperty("portal.url", getMockServerUrl());
        System.setProperty("portal.url.account", getMockServerUrl());
        System.setProperty("portal.url.request", getMockServerUrl());
        System.setProperty("crowd.access.url", getMockServerUrl());
        System.setProperty("crowd.login.url", getMockServerUrl());
        System.setProperty("crowd.logout.url", getMockServerUrl());
        System.setProperty("rest.api.ripeUrl", getMockServerUrl());
        System.setProperty("dns.checker.url", getMockServerUrl());
        System.setProperty("server.servlet.context-path", "/db-web-ui");
        System.setProperty("internal.api.url", getMockServerUrl());
        System.setProperty("internal.api.key", "123");
        System.setProperty("rsng.api.key", "OMG");
        System.setProperty("rsng.api.url", getMockServerUrl());
        System.setProperty("syncupdates.api.url", getMockServerUrl());
        System.setProperty("rest.search.url", getMockServerUrl());
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
        System.setProperty("spring.profiles.active", "test");
        System.setProperty("git.commit.id.abbrev", "0");
    }

    @AfterClass
    public static void afterClass() {
        httpServerMock.stop();
    }

    protected int getLocalServerPort() {
        return this.localServerPort;
    }

    protected void mock(final String uri, final String response) {
        httpServerMock.mock(uri, response);
    }

    public void mock(final String pathAndQuery, final String responseBody, final String contentType, final int responseStatusCode) {
        httpServerMock.mock(pathAndQuery, responseBody, contentType, responseStatusCode, null);
    }

    protected static String getMockServerUrl() {
        return String.format("http://localhost:%d", httpServerMock.getPort());
    }

    protected String getServerUrl() {
        return String.format("http://localhost:%d", this.localServerPort);
    }

    public static String getResource(final String resource) {
        try {
            return Resources.toString(Resources.getResource(resource), Charsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
