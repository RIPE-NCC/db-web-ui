package net.ripe.whois.services;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.CrowdTokenFilter;
import net.ripe.whois.web.api.whois.domain.NameValuePair;
import net.ripe.whois.web.api.whois.domain.WhoisWebDTO;
import org.junit.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriTemplate;

import java.net.URI;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class WhoisDomainObjectServiceTest extends AbstractIntegrationTest {

    @Test
    public void create_domain_object() {
        final HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.add("Cookie", CrowdTokenFilter.CROWD_TOKEN_KEY + "=aabbccdd");

        final WhoisWebDTO dto = new WhoisWebDTO();
        dto.passwords = Lists.newArrayList("test");
        dto.type = "prefix";
        dto.attributes = Lists.newArrayList(
            new NameValuePair("prefix", "22.22.0.0/22"),
            new NameValuePair("nserver", "ns.xs4all.nl"),
            new NameValuePair("nserver", "ns1.xs4all.nl"));

        final HttpEntity requestEntity = new HttpEntity<>(dto, requestHeaders);

        final ResponseEntity<String> response = restTemplate.exchange(createDomainUri(), HttpMethod.POST, requestEntity, String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getHeaders().get("Set-Cookie").get(0), containsString("DBSESSIONID"));
    }

    // helper methods

    private URI createDomainUri() {
        final Map<String, String> variables = Maps.newHashMap();
        variables.put("url", "http://localhost:" + getLocalServerPort());
        variables.put("source", "TEST");
        final URI uri = new UriTemplate("{url}/db-web-ui/api/whois/domain-objects/{source}").expand(variables);
        final UriComponentsBuilder uriComponentsBuilder = UriComponentsBuilder.fromUri(uri);
        return uriComponentsBuilder.build().encode().toUri();
    }

}
