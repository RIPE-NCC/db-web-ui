package net.ripe.whois.services;

import com.google.common.collect.Lists;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.SsoTokenFilter;
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
        dto.passwords = Lists.newArrayList("test");
        dto.type = "prefix";
        dto.attributes = Lists.newArrayList(
            new NameValuePair("prefix", "192.0.2.0/22"),
            new NameValuePair("nserver", "ns.test.nl"),
            new NameValuePair("nserver", "ns1.test.nl"));


        final ResponseEntity<String> response = post("/db-web-ui/api/whois/domain-objects/TEST", String.class, postEntity(dto));

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getHeaders().get("Set-Cookie").get(0), containsString("DBSESSIONID"));
    }

    // helper methods

    private HttpEntity<WhoisWebDTO> postEntity(final WhoisWebDTO dto) {
        return new HttpEntity(dto, ssoTokenKey());
    }

    private HttpHeaders ssoTokenKey() {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", SsoTokenFilter.SSO_TOKEN_KEY + "=aabbccdd");
        return requestHeaders;
    }
}
