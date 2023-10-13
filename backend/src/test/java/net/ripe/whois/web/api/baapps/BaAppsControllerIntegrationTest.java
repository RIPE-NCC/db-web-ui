package net.ripe.whois.web.api.baapps;

import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.config.CacheConfiguration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

public class BaAppsControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private CacheManager cacheManager;

    @AfterEach
    public void after() {
        cacheManager.getCache(CacheConfiguration.RESOURCE_TICKET_MEMBER_AND_RESOURCE_CACHE).clear();
    }

    @Test
    public void get_resource_tickets_success_more_specific_resource() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/resource-services/member-resources/7347", getResource("mock/member-resources-7347.json"));

        final ResponseEntity<String> response = get("/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is(
            "{\"tickets\":{\"192.0.0.0/20\":[{\"number\":\"NCC#201001020304\",\"date\":\"2008-09-15\",\"resource\":\"192.0.0.0/21\"}]}}"));
    }

    @Test
    public void get_resource_tickets_no_matching_resource() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/resource-services/member-resources/7347", getResource("mock/member-resources-7347.json"));

        final ResponseEntity<String> response = get("/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/127.0.0.1/32", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("{\"tickets\":{\"127.0.0.1/32\":[]}}"));
    }

    @Test
    public void get_resource_tickets_member_has_no_resources() {
        mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
        mock("/resource-services/member-resources/7347", getResource("mock/member-resources-100.json"));

        final ResponseEntity<String> response = get("/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is("{\"tickets\":{\"192.0.0.0/20\":[]}}"));
    }

    @Test
    public void get_resource_tickets_invalid_org_id() {
        mock("/api/user/info?clientIp=127.0.0.1", "{}");
        mock("/resource-services/member-resources/7347", "{}");

        final ResponseEntity<String> response = get("/db-web-ui/api/ba-apps/resources/INVALID/192.0.0.0/20", String.class, invalidSsoCookie());

        assertThat(response.getStatusCode(), is(HttpStatus.FORBIDDEN));
        assertThat(response.getBody(), is(nullValue()));
    }

    @Test
    public void get_resource_tickets_invalid_resource() {
        mock("/api/user/info?clientIp=127.0.0.1", "{}");
        mock("/resource-services/member-resources/7347", "{}");

        final ResponseEntity<String> response = get("/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/INVALID", String.class, invalidSsoCookie());

        assertThat(response.getStatusCode(), is(HttpStatus.FORBIDDEN));
        assertThat(response.getBody(), is(nullValue()));
    }

    @Test
    public void get_resource_tickets_user_info_invalid_cookie() {
        mock("/api/user/info?clientIp=127.0.0.1", "{\"errormessages\":{\"errormessage\":[{\"severity\":\"Error\",\"text\":\"Invalid token.\"}]}}", MediaType.APPLICATION_JSON_VALUE, HttpStatus.UNAUTHORIZED.value());
        mock("/resource-services/member-resources/7347", "{}");

        final ResponseEntity<String> response = get("/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20", String.class, invalidSsoCookie());

        assertThat(response.getStatusCode(), is(HttpStatus.FORBIDDEN));
        assertThat(response.getBody(), is(nullValue()));
    }


}
