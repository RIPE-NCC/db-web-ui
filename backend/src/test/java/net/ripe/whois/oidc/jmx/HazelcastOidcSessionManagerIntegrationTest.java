package net.ripe.whois.oidc.jmx;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.config.hazelcast.jmx.HazelcastOidcSessionManager;
import net.ripe.whois.oidc.OidcTestConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.session.OidcSessionInformation;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static net.ripe.whois.config.hazelcast.HazelcastOidcSessionRegistry.OIDC_SESSIONS_MAP;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;

@Import(OidcTestConfig.class)
@Profile("test-it")
class HazelcastOidcSessionManagerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private HazelcastInstance hazelcast;

    @Autowired
    private HazelcastOidcSessionManager manager;

    private IMap<String, OidcSessionInformation> map;

    @BeforeEach
    void setUp() {
        map = hazelcast.getMap(OIDC_SESSIONS_MAP);
        map.clear();
    }

    // getSessionDetailsByEmail

    @Test
    void returns_details_of_the_session_with_matching_email() {
        save("session-1", "user-1", "test@test.com");
        save("session-2", "user-2", "person@test.net");

        final List<String> result = manager.getSessionDetailsByEmail("test@test.com");

        assertThat(result, hasSize(1));
        assertThat(result.getFirst(), containsString("""
                sessionId: session-1
                principal name: user-1
                email: test@test.com
                """));
    }

    @Test
    void email_match_is_case_insensitive() {
        save("session-1", "user-1", "Test@Test.com");

        assertThat(manager.getSessionDetailsByEmail("test@test.COM"), hasSize(1));
    }

    @Test
    void returns_every_session_of_the_same_email() {
        save("session-1", "user-1", "test@test.com");
        save("session-2", "user-1", "test@test.com");
        save("session-3", "user-2", "person@test.net");

        final List<String> result = manager.getSessionDetailsByEmail("test@test.com");

        assertThat(result, hasSize(2));
        assertThat(result.getFirst(), containsString("sessionId: session-1"));
        assertThat(result.get(1), containsString("sessionId: session-2"));
    }

    @Test
    void returns_empty_list_for_unknown_email() {
        save("session-1", "user-1", "test@test.com");

        assertThat(manager.getSessionDetailsByEmail("nonExisting@test.es"), is(empty()));
    }

    @Test
    void returns_empty_list_when_there_are_no_sessions() {
        assertThat(manager.getSessionDetailsByEmail("test@test.com"), is(empty()));
    }

    // ---- getSession ----

    @Test
    void returns_details_of_an_existing_session() {
        save("session-1", "user-1", "test@test.com");

        final String result = manager.getSession("session-1");

        assertThat(result, containsString("""
                        sessionId: session-1
                        principal name: user-1
                        email: test@test.com
                        """));
    }

    @Test
    void returns_null_for_unknown_session() {
        assertThat(manager.getSession("missing"), is(nullValue()));
    }

    @Test
    void expiration_reflects_the_ttl_of_the_entry() {
        save("session-1", "user-1", "test@test.com");
        map.setTtl("session-1", 1, TimeUnit.HOURS);

        final String result = manager.getSession("session-1");

        final Instant expiration = Instant.parse(extract(result, "expiration: "));
        assertThat(expiration.isAfter(Instant.now().plusSeconds(50 * 60)), is(true));
        assertThat(expiration.isBefore(Instant.now().plusSeconds(61 * 60)), is(true));
    }

    @Test
    void expiration_moves_forward_when_ttl_is_renewed() throws Exception {
        save("session-1", "user-1", "test@test.com");
        map.setTtl("session-1", 10, TimeUnit.MINUTES);
        final Instant before = Instant.parse(extract(manager.getSession("session-1"), "expiration: "));

        Thread.sleep(1100);
        map.setTtl("session-1", 10, TimeUnit.MINUTES);
        final Instant after = Instant.parse(extract(manager.getSession("session-1"), "expiration: "));

        assertThat(after.isAfter(before), is(true));
    }

    // ---- removeSession ----

    @Test
    void removes_an_existing_session() {
        save("session-1", "user-1", "test@test.com");
        save("session-2", "user-2", "person@test.net");

        manager.removeSession("session-1");

        assertThat(map.containsKey("session-1"), is(false));
        assertThat(map.containsKey("session-2"), is(true));
    }

    @Test
    void removing_an_unknown_session_does_nothing() {
        save("session-1", "user-1", "test@test.com");

        manager.removeSession("missing");

        assertThat(map.containsKey("session-1"), is(true));
    }

    // ---- helpers ----

    private void save(final String sessionId, final String name, final String email) {
        final OidcIdToken idToken = OidcIdToken.withTokenValue("token-" + sessionId)
                .subject(name)
                .claim("email", email)
                .claim("sid", "idp-" + sessionId)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();
        final DefaultOidcUser user = new DefaultOidcUser(List.of(new SimpleGrantedAuthority("ROLE_USER")), idToken);
        map.put(sessionId, new OidcSessionInformation(sessionId, Map.of(), user));
    }

    private static String extract(final String text, final String prefix) {
        return text.lines()
                .filter(l -> l.startsWith(prefix))
                .map(l -> l.substring(prefix.length()).trim())
                .findFirst()
                .orElseThrow();
    }
}
