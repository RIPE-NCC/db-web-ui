package net.ripe.whois.services;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

// @Category(IntegrationTest.class)
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(loader = AnnotationConfigContextLoader.class)
public class WhoisInternalServiceTestIntegration extends AbstractJUnit4SpringContextTests {

    @Configuration
    @ComponentScan(basePackages = {"net.ripe.whois"})
    static class ContextConfiguration {
    }

    @Test
    public void test() {
        System.out.println("hello world");
    }
}
