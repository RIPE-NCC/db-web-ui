package net.ripe.whois.services;

import org.junit.jupiter.api.Test;

import jakarta.ws.rs.BadRequestException;
import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class WhoisProxyTest {

    public static final String HTTPS_TEST_WHOIS_RIPE_NET = "https://test.whois.ripe.net";

    @Test
    public void shouldReturnCorrectUrl() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("/db-web-ui/api/whois/api/user/info",
            "apiKey=DB-WHOIS-4a471957e3c7",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/user/info?apiKey=DB-WHOIS-4a471957e3c7", uri.toString());
    }

    @Test
    public void shouldReturnCorrectSearchUrl() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("/db-web-ui/api/whois/search?abuse-contact=true&flags=B&ignore404=true&managed-attributes=true&query-string=192.0.2.0+-+192.0.2.255&resource-holder=true",
            "",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/search?abuse-contact=true&flags=B&ignore404=true&managed-attributes=true&query-string=192.0.2.0+-+192.0.2.255&resource-holder=true", uri.toString());
    }

    @Test
    public void shouldReturnCorrectUrlWithQueryString() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("/db-web-ui/api/whois/api/user/info",
            "v=1&v=2",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/user/info?v=1&v=2", uri.toString());
    }

    @Test
    public void ipv6URL() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("/db-web-ui/api/whois/api/ripe/route6/2001:db8::/32AS33333",
            "",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/ripe/route6/2001:db8::/32AS33333", uri.toString());
    }

    @Test
    public void shouldReturnCorrectUrlWithPage() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("/db-web-ui/api/whois/api/resources/ipanalyser/ipv4.json",
            "org-id=ORG-TST17",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "/api/resources/ipanalyser/ipv4.json?org-id=ORG-TST17", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutBacklash() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/resources//api/whois../fmp-int/auditlog",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "//api/resources//api/whois../fmp-int/auditlog?value=test@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutDoubleBacklash() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/resources//api/whois....//fmp-int/auditlog",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "//api/resources//api/whois....//fmp-int/auditlog?value=test@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutTripleBacklash() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/resources//api/whois......///fmp-int/auditlog",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "//api/resources//api/whois......///fmp-int/auditlog?value=test@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWith2Dots() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/resources//api/../fmp-int/auditlog",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "//api/resources//api/../fmp-int/auditlog?value=test@ripe.net", uri.toString());
    }

    @Test
    public void shouldReturnUrlWithoutSingleBacklash() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/resources//api/whois./fmp-int/auditlog",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "//api/resources//api/whois./fmp-int/auditlog?value=test@ripe.net", uri.toString());
    }

    @Test
    public void shouldRedirectWithSpecialCharacters() {
        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        URI uri = whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/resources//api/whois··/fmp-int/auditlog",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET);

        assertEquals(HTTPS_TEST_WHOIS_RIPE_NET + "//api/resources//api/whois··/fmp-int/auditlog?value=test@ripe.net", uri.toString());
    }

    @Test
    public void shouldRemoveNormaliseUrlWithHtml() {
        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        assertThrows(BadRequestException.class, () -> whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api" +
                "/resources//api/whois··/fmp-int/auditlog/<script" +
                ">alert('Hi');</script>",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET));
    }

    @Test
    public void shouldRemoveNormaliseUrlWithSQL() {
        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        assertThrows(BadRequestException.class, () -> whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/resources//api/whois" +
                        "··/fmp-int/auditlog/select from 1 on 1",
            "value=test@ripe.net",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET));
    }

    @Test
    public void shouldRemoveAnyInjections() {

        WhoisProxy whoisProxy = new WhoisProxy("/db-web-ui");
        assertThrows(BadRequestException.class, () -> whoisProxy.composeProxyUrl("//db-web-ui/api/whois/api/..//resources//api/whois." +
                        "./fmp-int/auditlog/select",
            "id=2 and 1=2",
            "/api/whois",
            HTTPS_TEST_WHOIS_RIPE_NET));

    }

}
