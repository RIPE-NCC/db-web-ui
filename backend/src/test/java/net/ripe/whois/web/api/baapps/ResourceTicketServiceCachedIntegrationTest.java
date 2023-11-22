package net.ripe.whois.web.api.baapps;

import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.services.RsngService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResourceTicketServiceCachedIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    private RsngService rsngService;

    @BeforeEach
    public void mockRsng() {
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
