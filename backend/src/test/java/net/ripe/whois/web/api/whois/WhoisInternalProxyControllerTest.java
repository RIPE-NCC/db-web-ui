package net.ripe.whois.web.api.whois;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

import static org.junit.Assert.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class WhoisInternalProxyControllerTest {

    private static final String CROWD_TOKEN = "rRrR5L8b9zksKdrl6r1zYg00";

    @Mock
    private WhoisInternalService whoisInternalService;
    @InjectMocks
    private WhoisInternalProxyController subject;

    public WhoisInternalProxyControllerTest() {
    }

    @Test
    public void whoisInternalUserInfoMustReturnValue() throws IOException {
        UserInfoResponse mockedUserInfoData = (new ObjectMapper())
            .readValue(AbstractIntegrationTest.getResource("mock/user-info.json"),
                UserInfoResponse.class);

        when(whoisInternalService.getUserInfo(CROWD_TOKEN)).thenReturn(mockedUserInfoData);

        ResponseEntity<?> response = subject.whoisInternalUserInfo(CROWD_TOKEN);
        verify(whoisInternalService, Mockito.times(1)).getUserInfo(CROWD_TOKEN);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockedUserInfoData, response.getBody());
    }

    @Test
    public void whoisInternalUserInfoMustReturnUnAuthorisedIfCookieIsEmpty() {
        ResponseEntity<?> response = subject.whoisInternalUserInfo("");
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(whoisInternalService, Mockito.never()).getUserInfo("");
    }

    @Test
    public void whoisInternalUserInfoMustReturnUnAuthorisedIfCookieIsNull() {
        ResponseEntity<?> response = subject.whoisInternalUserInfo(null);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(whoisInternalService, Mockito.never()).getUserInfo("");
    }

}
