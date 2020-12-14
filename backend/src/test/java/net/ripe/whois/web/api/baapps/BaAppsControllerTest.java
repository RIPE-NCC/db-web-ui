package net.ripe.whois.web.api.baapps;

import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Collections;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class BaAppsControllerTest {


    private static final String CROWD_TOKEN = "rRrR5L8b9zksKdrl6r1zYg00";

    private static final ResourceTicketResponse.ResourceTicket RESOURCE_TICKET_AS3333 = new ResourceTicketResponse.ResourceTicket("NCC#201707030123", "2017-07-03", "AS3333");

    private static final ResourceTicketResponse RESOURCE_TICKET_RESPONSE = new ResourceTicketResponse();
    static {
        RESOURCE_TICKET_RESPONSE.addTickets("AS3333", Collections.singletonList(RESOURCE_TICKET_AS3333));
    }

    private static final ResourceTicketMap RESOURCE_TICKET_MAP = new ResourceTicketMap();
    static {
        RESOURCE_TICKET_MAP.addTickets(ResourceTicketMap.KeyType.ASN, Collections.singletonList(RESOURCE_TICKET_AS3333));
    }

    @Mock
    private WhoisInternalService whoisInternalService;
    @Mock
    private ResourceTicketService resourceTicketService;
    @InjectMocks
    private BaAppsController subject;

    @Before
    public void setup() throws Exception {
        UserInfoResponse userInfoResponse = new UserInfoResponse();
        // orgObjectId can be null in FYI pseudo-LIRs objects
        UserInfoResponse.Member memberFyi = new UserInfoResponse.Member();
        memberFyi.membershipId = 234L;
        memberFyi.orgObjectId = null;
        UserInfoResponse.Member member = new UserInfoResponse.Member();
        member.membershipId = 123L;
        member.orgObjectId = "ORG-RIEN1-RIPE";
        userInfoResponse.members = new ArrayList<UserInfoResponse.Member>() {{
            add(memberFyi);
            add(member);
        }};

        when(whoisInternalService.getUserInfo(CROWD_TOKEN)).thenReturn(userInfoResponse);
        when(resourceTicketService.getTicketsForMember(123L)).thenReturn(RESOURCE_TICKET_MAP);
        when(resourceTicketService.filteredResponse("AS3333", RESOURCE_TICKET_MAP)).thenReturn(RESOURCE_TICKET_RESPONSE);
    }

    @Test
    public void get_tickets() {
        final ResponseEntity response = subject.getTickets(CROWD_TOKEN, "ORG-RIEN1-RIPE", "AS3333");
        assertThat(response.getStatusCode(), is(HttpStatus.OK));
        assertThat(response.getBody(), is(RESOURCE_TICKET_RESPONSE));
    }

    @Test
    public void get_tickets_invalid_org_id() {
        final ResponseEntity response = subject.getTickets(CROWD_TOKEN, "INVALID", "193.0.0.0 - 193.0.23.255");

        assertThat(response.getStatusCode(), is(HttpStatus.FORBIDDEN));
        assertThat(response.getBody(), is(nullValue()));
    }

    @Test
    public void get_tickets_invalid_resource() {
        final ResponseEntity response = subject.getTickets(CROWD_TOKEN, "ORG-RIEN1-RIPE", "INVALID");

        assertThat(response.getStatusCode(), is(HttpStatus.FORBIDDEN));
        assertThat(response.getBody(), is(nullValue()));
    }

}
