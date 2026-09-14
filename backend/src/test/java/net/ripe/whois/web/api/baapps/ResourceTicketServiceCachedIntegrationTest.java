package net.ripe.whois.web.api.baapps;

import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.oidc.KeycloakIdPDummyService;
import net.ripe.whois.oidc.OidcTestConfig;
import net.ripe.whois.services.RsngService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizeRequest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@Import(OidcTestConfig.class)
class ResourceTicketServiceCachedIntegrationTest extends AbstractIntegrationTest {

    @Mock
    private OAuth2AuthenticationToken oAuth2AuthenticationToken;
    @Mock
    private OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;

    @Mock
    private OAuth2AuthorizedClient authorizedClient;

    @MockitoBean
    private RsngService rsngService;

    @Autowired
    private KeycloakIdPDummyService keycloakIdPDummyService;

    @BeforeEach
    public void mockRsng() {
        keycloakIdPDummyService.registerUser("authorised",
                new KeycloakIdPDummyService.FakeUser("ba-apps-user", "ba-apps@example.com", "idp-sid-ba-apps"));

        when(oAuth2AuthenticationToken.getAuthorizedClientRegistrationId()).thenReturn("keycloak");
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(oAuth2AuthorizedClientManager.authorize(any(OAuth2AuthorizeRequest.class))).thenReturn(authorizedClient);
        when(rsngService.getMemberResources(anyLong())).thenReturn(getResource("mock/member-resources-100.json", MemberResources.class));
    }

    @Test
    public void get_tickets_for_member_is_cached() {
        for (int i =0; i<5; i++) {
            mock("/api/user/info?clientIp=127.0.0.1", getResource("mock/user-info.json"));
            final ResponseEntity<String> response = get("/db-web-ui/api/ba-apps/resources/ORG-TST3-RIPE/192.0.0.0/20", String.class);

            assertThat(response.getStatusCode(), is(HttpStatus.OK));
            assertThat(response.getBody(), is("{\"tickets\":{\"192.0.0.0/20\":[]}}"));
        }

        verify(rsngService).getMemberResources(anyLong());
    }


}
