package net.ripe.whois.services;

import net.ripe.whois.AbstractIntegrationTest;
import org.apache.commons.io.IOUtils;
import org.eclipse.jetty.http.HttpHeader;
import org.eclipse.jetty.http.HttpScheme;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.Charset;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class RedirectIntegrationTest extends AbstractIntegrationTest {

    @Test
    public void abuse_finder() {
        final ResponseEntity<String> response =
            restTemplate.exchange(getServerUrl() + "/search/abuse-finder.html", HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.FOUND));
        assertThat(response.getHeaders().getLocation(), is(URI.create("https://www.ripe.net/support/abuse")));
    }

    @Test
    public void root_redirect() {
        final ResponseEntity<String> response =
            restTemplate.exchange(getServerUrl(), HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create(getServerUrl() + "/db-web-ui/query")));
    }

    @Test
    public void search_lookup() {
        final ResponseEntity<String> response =
            restTemplate.exchange(
                getServerUrl() + "/search/lookup.html?source=ripe&key=2001:600:3000::/48&type=inet6num",
                HttpMethod.GET,
                null,
                String.class
            );
        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create(getServerUrl() + "/db-web-ui/lookup?source=ripe&key=2001:600:3000::/48&type=inet6num")));
    }

    @Test
    public void search() {
        final ResponseEntity<String> response =
            restTemplate.exchange(
                getServerUrl() + "/search?source=ripe&source=apnic-grs&flags=no-referenced&flags=no-irt&abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&query-string=10.0.0.1",
                HttpMethod.GET,
                null,
                String.class
            );
        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create(getServerUrl() + "/db-web-ui/query?source=ripe&source=apnic-grs&flags=no-referenced&flags=no-irt&abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&query-string=10.0.0.1")));
    }

    @Test
    public void https_redirect_with_query_param() {
        final ResponseEntity<String> response =
            restTemplate.exchange(
                getServerUrl() + "/search?source=ripe&source=apnic-grs&flags=no-referenced&flags=no-irt&abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&query-string=10.0.0.1",
                HttpMethod.GET,
                new HttpEntity<>(getHttpHeaders()),
                String.class
            );
        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create("https://localhost/search?source=ripe&source=apnic-grs&flags=no-referenced&flags=no-irt&abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&query-string=10.0.0.1")));
    }

    @Test
    public void https_redirect() {
        final ResponseEntity<String> response =
            restTemplate.exchange(
                getServerUrl() + "/whois/lookup/ripe/inetnum/10.0.0.0-10.0.0.255.html",
                HttpMethod.GET,
                new HttpEntity<>(getHttpHeaders()),
                String.class
            );
        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create("https://localhost/whois/lookup/ripe/inetnum/10.0.0.0-10.0.0.255.html")));
    }

    @Test
    public void default_bad_request() {
        final ResponseEntity<String> response =
            restTemplate.exchange(
                getServerUrl() + "/doesnt_exist",
                HttpMethod.GET,
                null,
                String.class
            );
        assertThat(response.getStatusCode(), is(HttpStatus.BAD_REQUEST));
    }

    @Test
    public void request_with_query_string() throws IOException {
        mock("/search?abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&flags=r&offset=0&limit=20&query-string=10.0.0.1",
            IOUtils.toString(getClass().getResourceAsStream("/mock/search.xml"), Charset.defaultCharset()),
            MediaType.APPLICATION_XML,
            HttpStatus.OK.value());

        final ResponseEntity<String> response =
            restTemplate.exchange(
                getServerUrl() + "/db-web-ui/api/whois/search?abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&flags=r&offset=0&limit=20&query-string=10.0.0.1",
                HttpMethod.GET,
                null,
                String.class
            );
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.toString().contains("6.0.0.0 - 13.115.255.255"), is(true));
    }

    private HttpHeaders getHttpHeaders() {
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(HttpHeader.X_FORWARDED_PROTO.toString(), HttpScheme.HTTP.toString());
        return httpHeaders;
    }
}
