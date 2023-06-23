package net.ripe.whois.web.api.whois;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class WhoisInternalProxyControllerTest {

    private static final String SSO_TOKEN = "rRrR5L8b9zksKdrl6r1zYg00";

    @Mock
    private HttpServletRequest request;
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

        when(request.getRemoteAddr()).thenReturn("");
        when(whoisInternalService.getUserInfo(SSO_TOKEN, "")).thenReturn(mockedUserInfoData);

        ResponseEntity<?> response = subject.whoisInternalUserInfo(request, SSO_TOKEN);
        verify(whoisInternalService, Mockito.times(1)).getUserInfo(SSO_TOKEN, "");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockedUserInfoData, response.getBody());
    }

    @Test
    public void whoisInternalUserInfoMustReturnUnAuthorisedIfCookieIsEmpty() {
        ResponseEntity<?> response = subject.whoisInternalUserInfo(request, "");
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(whoisInternalService, Mockito.never()).getUserInfo("", "");
    }

    @Test
    public void whoisInternalUserInfoMustReturnUnAuthorisedIfCookieIsNull() {
        ResponseEntity<?> response = subject.whoisInternalUserInfo(request, null);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(whoisInternalService, Mockito.never()).getUserInfo("", "");
    }

}
