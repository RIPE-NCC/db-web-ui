package net.ripe.whois.services;

import com.google.common.collect.Lists;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.config.OidcUtils;
import net.ripe.whois.web.api.whois.domain.NameValuePair;
import net.ripe.whois.web.api.whois.domain.WhoisWebDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;

public class WhoisDomainObjectServiceIntegrationTest extends AbstractIntegrationTest {

    @Test
    public void create_domain_object() {

        final WhoisWebDTO dto = new WhoisWebDTO();
        dto.type = "prefix";
        dto.attributes = Lists.newArrayList(
            new NameValuePair("prefix", "192.0.2.0/22"),
            new NameValuePair("nserver", "ns.test.nl"),
            new NameValuePair("nserver", "ns1.test.nl"));


        final String xsrfToken = extractXsrfCookie();

        final HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("aabbccdd");
        headers.add(HttpHeaders.COOKIE, OidcUtils.OIDC_CSRF_COOKIE_NAME + "=" + xsrfToken);
        headers.add("X-XSRF-TOKEN", xsrfToken);

        final HttpEntity<WhoisWebDTO> entity = new HttpEntity<>(dto, headers);

        final ResponseEntity<String> response = post(
                "/db-web-ui/api/whois/domain-objects/TEST",
                String.class,
                entity
        );

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getHeaders().get("Set-Cookie").getFirst(), containsString(OidcUtils.OIDC_LOCAL_COOKIE_NAME));
    }

}
