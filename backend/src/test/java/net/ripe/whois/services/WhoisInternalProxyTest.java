package net.ripe.whois.services;

import org.junit.Test;
import java.net.URI;
import static org.junit.Assert.assertEquals;

public class WhoisInternalProxyTest {

    public static final String HTTPS_TEST_WHOIS_RIPE_NET = "https://test.whois.ripe.net";

    @Test
    public void shouldReturnCorrectUrl() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("/db-web-ui/api/whois-internal/api/user/info",
            "",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "DB-WHOIS-d5395e7fbf8d");

        assertEquals("https://test.whois.ripe.net/api/user/info?apiKey=DB-WHOIS-d5395e7fbf8d", uri.toString());
    }

    @Test
    public void shouldReturnCorrectUrlWithQueryString() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("/db-web-ui/api/whois-internal/api/user/info",
            "v=1&v=2",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "DB-WHOIS-d5395e7fbf8d");

        assertEquals("https://test.whois.ripe.net/api/user/info?v=1&v=2&apiKey=DB-WHOIS-d5395e7fbf8d", uri.toString());
    }

    @Test
    public void shouldReturnCorrectUrlWithPage() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("/db-web-ui/api/whois-internal/api/resources/ipanalyser/ipv4.json",
            "org-id=ORG-CSL9",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "DB-WHOIS-d5395e7fbf8d");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/ipanalyser/ipv4.json?org-id=ORG-CSL9&apiKey=DB-WHOIS-d5395e7fbf8d", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutBacklash() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal../fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldReturnUrlWithoutBacklash");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/whois-internal../fmp-int/auditlog?value=tpolychnia@ripe.net&apiKey=TEST-shouldReturnUrlWithoutBacklash", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutDoubleBacklash() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal....//fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldReturnUrlWithoutDoubleBacklash");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/whois-internal..../fmp-int/auditlog?value=tpolychnia@ripe.net&apiKey=TEST-shouldReturnUrlWithoutDoubleBacklash", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutTripleBacklash() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal......///fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldReturnUrlWithoutTripleBacklash");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/whois-internal....../fmp-int/auditlog?value=tpolychnia@ripe.net&apiKey=TEST-shouldReturnUrlWithoutTripleBacklash", uri.toString());
    }

    @Test
    public void shouldReturnUrlWith2Dots() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/../fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldReturnUrlWith2Dots");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/../fmp-int/auditlog?value=tpolychnia@ripe.net&apiKey=TEST-shouldReturnUrlWith2Dots", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutSingleBacklash() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal./fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldReturnUrlWithoutSingleBacklash");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/whois-internal./fmp-int/auditlog?value=tpolychnia@ripe.net&apiKey=TEST-shouldReturnUrlWithoutSingleBacklash", uri.toString());
    }

    @Test
    public void shouldThrowErrorOnSpecialCharacters() {
        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal··/fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldThrowErrorOnSpecialCharacters");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/whois-internal··/fmp-int/auditlog?value=tpolychnia@ripe.net&apiKey=TEST-shouldThrowErrorOnSpecialCharacters", uri.toString());
    }

    @Test
    public void shouldRemoveNormaliseUrlWithHtml() {
        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal··/fmp-int/auditlog/<script>alert('Hi');</script>",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldRemoveNormaliseUrlWithHtml");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/whois-internal··/fmp-int/auditlog/%3Cscript%3Ealert('Hi');%3C/script%3E?value=tpolychnia@ripe.net&apiKey=TEST-shouldRemoveNormaliseUrlWithHtml", uri.toString());
    }

    @Test
    public void shouldRemoveNormaliseUrlWithSQL() {
        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal··/fmp-int/auditlog/select from 1 on 1",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldRemoveNormaliseUrlWithSQL");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/api/whois-internal··/fmp-int/auditlog/select%20from%201%20on%201?value=tpolychnia@ripe.net&apiKey=TEST-shouldRemoveNormaliseUrlWithSQL", uri.toString());
    }

    @Test
    public void shouldRemoveAnyInjections() {

        WhoisInternalProxy whoisInternalProxy = new WhoisInternalProxy("/db-web-ui");
        URI uri = whoisInternalProxy.composeProxyUrl("//db-web-ui/api/whois-internal/api/..//resources//api/whois-internal../fmp-int/auditlog/select",
            "id=2 and 1=2",
            "/api/whois-internal",
            HTTPS_TEST_WHOIS_RIPE_NET,
            "TEST-shouldRemoveAnyInjections");

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/../resources/api/whois-internal../fmp-int/auditlog/select?id=2%20and%201=2&apiKey=TEST-shouldRemoveAnyInjections", uri.toString());
    }
}
