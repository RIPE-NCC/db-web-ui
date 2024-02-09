package net.ripe.whois.services;

import jakarta.ws.rs.core.MediaType;
import net.ripe.whois.AbstractIntegrationTest;
import org.eclipse.jetty.http.HttpHeader;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.net.URI;
import java.util.Objects;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;


public class RedirectIntegrationTest extends AbstractIntegrationTest {

    @Test
    public void abuse_finder() {
        final ResponseEntity<String> response = get("/search/abuse-finder.html", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.FOUND));
        assertThat(response.getHeaders().getLocation(), is(URI.create("https://www.ripe.net/support/abuse")));
    }

    @Test
    public void root_redirect() {
        final ResponseEntity<String> response = get("/", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create(getServerUrl() + "/db-web-ui/query")));
    }

    @Test
    public void https_redirect_with_query_param() {
        final ResponseEntity<String> response = get(
                "/search?source=ripe&source=apnic-grs&flags=no-referenced&flags=no-irt&abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&query-string=10.0.0.1",
                String.class,
                xForwardedProto("http"));

        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create("https://localhost/search?source=ripe&source=apnic-grs&flags=no-referenced&flags=no-irt&abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&query-string=10.0.0.1")));
    }

    @Test
    public void https_redirect() {
        final ResponseEntity<String> response = get("/whois/lookup/ripe/inetnum/10.0.0.0-10.0.0.255.html", String.class, xForwardedProto("http"));

        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create("https://localhost/whois/lookup/ripe/inetnum/10.0.0.0-10.0.0.255.html")));
    }

    @Test
    public void default_not_found() {
        final ResponseEntity<String> response = get("/doesnt_exist", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.NOT_FOUND));
    }

    @Test
    public void request_with_query_string() throws IOException {
        mock("/search?abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&flags=r&offset=0&limit=20&query-string=10.0.0.1&clientIp=127.0.0.1",
            getResource("mock/search.xml"),
            MediaType.APPLICATION_XML,
            HttpStatus.OK.value());

        final ResponseEntity<String> response = get("/db-web-ui/api/whois/search?abuse-contact=true&ignore404=true&managed-attributes=true&resource-holder=true&flags=r&offset=0&limit=20&query-string=10.0.0.1", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.toString().contains("6.0.0.0 - 13.115.255.255"), is(true));
    }

    @Test
    public void http_request_with_https_x_forwarded_proto() {
        final ResponseEntity<String> response = get("/", String.class, xForwardedProto("https"));

        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create(getServerUrlHttps() + "/db-web-ui/query")));
    }

    @Test
    public void search_specific_docs() {
        final ResponseEntity<String> response = get("/docs/RPSL-Object-Types/", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.toString(), containsString("RPSL Object Types"));
    }

    @Test
    public void search_specific_docs_index() {
        final ResponseEntity<String> response = get("/docs/RPSL-Object-Types/index.html", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.toString(), containsString("RPSL Object Types"));
    }

    @Test
    public void search_docs_without_slash() {
        final ResponseEntity<String> response = get("/docs", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.FOUND));
        assertThat(response.getHeaders().getLocation(), is(URI.create(getServerUrl() + "/docs/")));
    }

    @Test
    public void search_docs_correct_path() {
        final ResponseEntity<String> response = get("/docs/", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getHeaders().get("Cache-Control"), is(not(nullValue())));
        assertThat(Objects.requireNonNull(response.getHeaders().get("Cache-Control")), is(not(empty())));
        assertThat(response.toString(), containsString("Introduction to the RIPE Database"));
    }


    @Test
    public void redirect_http_to_https() {
        final ResponseEntity<String> response = get("/whois/use-cases/abuse-finder.json?source=ripe&primary-key=192.0.2.0", String.class, xForwardedProto("http"));

        assertThat(response.getStatusCode(), is(HttpStatus.MOVED_PERMANENTLY));
        assertThat(response.getHeaders().getLocation(), is(URI.create(getServerUrlHttpsWithOutPort() + "/whois/use-cases/abuse-finder.json?source=ripe&primary-key=192.0.2.0")));
    }

    @Test
    public void get_favicon_from_resources_path() {
        final ResponseEntity<String> response = get("/favicon.ico", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getHeaders().get("Cache-Control"), is(not(nullValue())));
        assertThat(Objects.requireNonNull(response.getHeaders().get("Cache-Control")), is(not(empty())));
    }

    private HttpEntity<String> xForwardedProto(final String scheme) {
        final HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(HttpHeader.X_FORWARDED_PROTO.toString(), scheme);
        return new HttpEntity<>(httpHeaders);
    }

}
