package net.ripe.whois.services;

import net.ripe.whois.AbstractTestIntegration;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

// @Category(IntegrationTest.class)
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(loader = AnnotationConfigContextLoader.class)
public class WhoisInternalServiceTestIntegration extends AbstractTestIntegration {

    @Autowired
    private WhoisInternalService whoisInternalService;

    @Autowired
    public ApplicationContext applicationContext;

    @BeforeClass
    public static void beforeClass() {
        AbstractTestIntegration.beforeClass();
        System.setProperty("internal.api.url", String.format("http://localhost:%d", httpServerMock.getPort()));
        System.setProperty("internal.api.key", "123");
    }

    @Test
    public void get_maintainers() {
        httpServerMock.mock(
            "/api/user/fd2ca42b-b997-475a-886b-ae410d1c5969/maintainers",
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
            "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
            "<objects>\n" +
            "<object type=\"mntner\">\n" +
            "    <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/SHRYANE-MNT\"/>\n" +
            "    <source id=\"ripe\"/>\n" +
            "    <primary-key>\n" +
            "        <attribute name=\"mntner\" value=\"SHRYANE-MNT\"/>\n" +
            "    </primary-key>\n" +
            "    <attributes>\n" +
            "        <attribute name=\"mntner\" value=\"SHRYANE-MNT\"/>\n" +
            "        <attribute name=\"descr\" value=\"RIPE NCC Database Department\"/>\n" +
            "        <attribute name=\"admin-c\" value=\"ES7554-RIPE\" referenced-type=\"person\">\n" +
            "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/person/ES7554-RIPE\"/>\n" +
            "        </attribute>\n" +
            "        <attribute name=\"tech-c\" value=\"ES7554-RIPE\" referenced-type=\"person\">\n" +
            "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/person/ES7554-RIPE\"/>\n" +
            "        </attribute>\n" +
            "        <attribute name=\"auth\" value=\"MD5-PW\" comment=\"Filtered\"/>\n" +
            "        <attribute name=\"auth\" value=\"SSO\" comment=\"Filtered\"/>\n" +
            "        <attribute name=\"auth\" value=\"PGPKEY-28F6CD6C\" referenced-type=\"key-cert\">\n" +
            "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/key-cert/PGPKEY-28F6CD6C\"/>\n" +
            "        </attribute>\n" +
            "        <attribute name=\"mnt-by\" value=\"SHRYANE-MNT\" referenced-type=\"mntner\">\n" +
            "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/SHRYANE-MNT\"/>\n" +
            "        </attribute>\n" +
            "        <attribute name=\"created\" value=\"2013-12-10T16:55:06Z\"/>\n" +
            "        <attribute name=\"last-modified\" value=\"2016-09-07T14:58:03Z\"/>\n" +
            "        <attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>\n" +
            "    </attributes>\n" +
            "</object>\n" +
            "</objects>\n" +
            "<terms-and-conditions xlink:type=\"locator\" xlink:href=\"http://www.ripe.net/db/support/db-terms-conditions.pdf\"/>\n" +
            "</whois-resources>");

        final List<Map<String, Object>> maintainers = whoisInternalService.getMaintainers(UUID.fromString("fd2ca42b-b997-475a-886b-ae410d1c5969"));

        assertThat(maintainers.size(), is(1));
        final Map<String, Object> maintainer = maintainers.get(0);
        assertThat(maintainer.get("mine").toString(), is("true"));
        assertThat(((List<String>)maintainer.get("auth")), containsInAnyOrder("MD5-PW", "SSO", "PGPKEY-28F6CD6C"));
        assertThat(maintainer.get("type"), is("mntner"));
        assertThat(maintainer.get("key"), is("SHRYANE-MNT"));

    }
}
