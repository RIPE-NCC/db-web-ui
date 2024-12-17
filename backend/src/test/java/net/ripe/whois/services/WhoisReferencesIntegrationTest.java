package net.ripe.whois.services;

import net.ripe.whois.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;

public class WhoisReferencesIntegrationTest extends AbstractIntegrationTest {

    @Test
    public void read_references() {
        mock("/references/RIPE/inetnum/212.154.128.20%20-%20212.154.128.23?limit=5",
            "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
             "<references><primaryKey>212.154.128.20 - 212.154.128.23</primaryKey>" +
             "<objectType>inetnum</objectType>" +
             "<incoming/>" +
             "<outgoing/>" +
             "</references>");

        final ResponseEntity<String> response = get("/db-web-ui/api/references/RIPE/inetnum/212.154.128.20 - 212.154.128.23", String.class);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("<primaryKey>212.154.128.20 - 212.154.128.23</primaryKey>"));
    }

    @Test
    public void create_references() {
        mock("/references/RIPE", "test");

        final ResponseEntity<String> response = post("/db-web-ui/api/references/RIPE", String.class, entity("test"));

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("test"));
    }

    @Test
    public void delete_references() {
        mock("/references/RIPE/inetnum/212.154.128.20%20-%20212.154.128.23?reason=delete%20reason&password=test%25ing", "test");

        final ResponseEntity<String> response = delete("/db-web-ui/api/references/RIPE/inetnum/212.154.128.20 - 212.154.128.23?password=test%ing&reason=delete reason", String.class, entity("test"));

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), containsString("test"));
    }

    //helper methods

    private HttpEntity entity(Object body) {
        return new HttpEntity(body);
    }

}
