package net.ripe.whois.services;

import org.junit.Test;
import java.net.URI;
import static org.junit.Assert.assertEquals;

public class WhoisProxyUrlTest {

    @Test
    public void shouldReturnCorrectUrl() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("/db-web-ui/api/whois-internal/api/user/info",
            "",
            "/api/whois-internal",
            "https://test.whois.ripe.net",
            "DB-WHOIS-d5395e7fbf8d");

        assertEquals("https://test.whois.ripe.net/api/user/info?apiKey=DB-WHOIS-d5395e7fbf8d", uri.toString());
    }

    @Test
    public void shouldReturnCorrectUrlWithQueryString() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("/db-web-ui/api/whois-internal/api/user/info",
            "v=1&v=2",
            "/api/whois-internal",
            "https://test.whois.ripe.net",
            "DB-WHOIS-d5395e7fbf8d");

        assertEquals("https://test.whois.ripe.net/api/user/info?v=1&v=2&apiKey=DB-WHOIS-d5395e7fbf8d", uri.toString());
    }

    @Test
    public void shouldReturnCorrectUrlWithPage() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("/db-web-ui/api/whois-internal/api/resources/ipanalyser/ipv4.json",
            "org-id=ORG-CSL9",
            "/api/whois-internal",
            "https://test.whois.ripe.net",
            "DB-WHOIS-d5395e7fbf8d");

        assertEquals("https://test.whois.ripe.net/api/resources/ipanalyser/ipv4.json?org-id=ORG-CSL9&apiKey=DB-WHOIS-d5395e7fbf8d", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutBacklash() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal../fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");

        assertEquals("https://test.whois.ripe.net/api/resources/api/whois-internal../fmp-int/auditlog?value=tpolychnia@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutDoubleBacklash() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal....//fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");

        assertEquals("https://test.whois.ripe.net/api/resources/api/whois-internal..../fmp-int/auditlog?value=tpolychnia@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutTripleBacklash() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal......///fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");

        assertEquals("https://test.whois.ripe.net/api/resources/api/whois-internal....../fmp-int/auditlog?value=tpolychnia@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWith2Dots() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/../fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");

        assertEquals("https://test.whois.ripe.net/api/resources/api/../fmp-int/auditlog?value=tpolychnia@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutSingleBacklash() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal./fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");

        assertEquals("https://test.whois.ripe.net/api/resources/api/whois-internal./fmp-int/auditlog?value=tpolychnia@ripe.net", uri.toString());
    }

    @Test(expected = IllegalStateException.class)
    public void shouldThrowErrorOnSpecialCharacters() {
        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal··/fmp-int/auditlog",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");
    }

    @Test(expected = IllegalStateException.class)
    public void shouldRemoveNormaliseUrlWithHtml() {
        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal··/fmp-int/auditlog/<script>alert('Hi');</script>",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");
    }

    @Test(expected = IllegalStateException.class)
    public void shouldRemoveNormaliseUrlWithSQL() {
        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        URI uri = whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/resources//api/whois-internal··/fmp-int/auditlog/select from 1 on 1",
            "value=tpolychnia@ripe.net",
            "/api/whois-internal",
            "https://test.whois.ripe.net");
    }

    @Test(expected = IllegalStateException.class)
    public void shouldRemoveAnyInjections() {

        WhoisProxyUrl whoisProxyUrl = new WhoisProxyUrl("/db-web-ui");
        whoisProxyUrl.composeProxyUrl("//db-web-ui/api/whois-internal/api/..//resources//api/whois-internal../fmp-int/auditlog/select",
            "id=2 and 1=2",
            "/api/whois-internal",
            "https://test.whois.ripe.net");

    }

}