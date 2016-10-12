package net.ripe.whois;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.runner.RunWith;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(loader = AnnotationConfigContextLoader.class)
public class AbstractTestIntegration extends AbstractJUnit4SpringContextTests {

    protected static HttpServerMock httpServerMock;

    @Configuration
    @ComponentScan(basePackages = {"net.ripe.whois"})
    @EnableAutoConfiguration
    static class ContextConfiguration {
        // magic
    }

    @BeforeClass
    public static void beforeClass() {
        httpServerMock = new HttpServerMock();
        httpServerMock.start();

        System.setProperty("crowd.login.url", "");
        System.setProperty("crowd.rest.url", "");
        System.setProperty("crowd.rest.user", "");
        System.setProperty("crowd.rest.password", "");
        System.setProperty("server.contextPath", "/db-web-ui");
        System.setProperty("rest.api.ripeUrl", "");
        System.setProperty("ripe.search.queryUrl", "");

    }

    @AfterClass
    public static void afterClass() {
        httpServerMock.stop();
    }

}
