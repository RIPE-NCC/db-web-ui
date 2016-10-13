package net.ripe.whois;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.web.WebAppConfiguration;

/**
 * Base integration testing class for db-web-ui.
 *
 * Ref: http://docs.spring.io/spring-boot/docs/1.2.7.RELEASE/reference/html/boot-features-testing.html
 *
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ActiveProfiles(profiles = "test")
@SpringApplicationConfiguration(classes = {Application.class, AbstractTestIntegration.ContextConfiguration.class})
@ComponentScan(basePackages = {"net.ripe.whois"}, excludeFilters = @ComponentScan.Filter(type = FilterType.REGEX, pattern = {"\\*TestConfiguration"}))
@TestExecutionListeners(inheritListeners = false, listeners = {DependencyInjectionTestExecutionListener.class, DirtiesContextTestExecutionListener.class})
@IntegrationTest("server.port:0")
@WebAppConfiguration
public class AbstractTestIntegration extends AbstractJUnit4SpringContextTests {

    protected static final String CROWD_COOKIE_NAME = "crowd.token_key";
    protected static final String CROWD_COOKIE_VALUE = "aabbccdd";
    protected static final String CROWD_SESSION_PATH = "/rest/usermanagement/1/session";
    protected static final String CROWD_USER_ATTRIBUTE_PATH = "/rest/usermanagement/1/user/attribute";

    @Configuration
    static class ContextConfiguration {
        @Bean
        public TestRestTemplate testRestTemplate() {
            return new TestRestTemplate();
        }
    }

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
        System.setProperty("crowd.login.url", getMockServerUrl());
        System.setProperty("crowd.rest.url", getMockServerUrl());
        System.setProperty("rest.api.ripeUrl", getMockServerUrl());
        System.setProperty("ripe.search.queryUrl", getMockServerUrl());
        System.setProperty("crowd.rest.user", "username");
        System.setProperty("crowd.rest.password", "password");
        System.setProperty("server.contextPath", "/db-web-ui");
    }

    @AfterClass
    public static void afterClass() {
        httpServerMock.stop();
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
}
