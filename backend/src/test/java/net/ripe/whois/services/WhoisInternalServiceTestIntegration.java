package net.ripe.whois.services;

import net.ripe.whois.AbstractTestIntegration;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class WhoisInternalServiceTestIntegration extends AbstractTestIntegration {

    @BeforeClass
    public static void beforeClass() {
        AbstractTestIntegration.beforeClass();
        System.setProperty("internal.api.url", getMockServerUrl());
        System.setProperty("internal.api.key", "123");
    }

    @Before
    public void setup() {
        mockCrowdSession();
        mockCrowdUser();
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
        final HttpEntity requestEntity = new HttpEntity(null, requestHeaders);

        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/user/mntners", HttpMethod.GET, requestEntity, String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is(
            "[{" +
            "\"mine\":true," +
            "\"auth\":[\"MD5-PW\",\"SSO\"]," +
            "\"type\":\"mntner\"," +
            "\"key\":\"BAD-MNT\"" +
            "}]"));
    }

    @Test
    public void get_maintainers_invalid_cookie() {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", "crowd.token_key=invalid");
        final HttpEntity requestEntity = new HttpEntity(null, requestHeaders);

        final ResponseEntity<String> response = restTemplate.exchange("http://localhost:" + getLocalServerPort() + "/db-web-ui/api/user/mntners", HttpMethod.GET, requestEntity, String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.UNAUTHORIZED));
    }

}
