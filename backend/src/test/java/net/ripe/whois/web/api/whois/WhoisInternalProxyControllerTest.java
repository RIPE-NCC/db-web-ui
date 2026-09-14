package net.ripe.whois.web.api.whois;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class WhoisInternalProxyControllerTest {

    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpHeaders httpHeaders;
    @Mock
    private WhoisInternalService whoisInternalService;
    @Mock
    private OAuth2AuthenticationToken oAuth2AuthenticationToken;

    @InjectMocks
    private WhoisInternalProxyController subject;

    @BeforeEach
    void setupAuthentication() {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(oAuth2AuthenticationToken);
        SecurityContextHolder.setContext(context);
    }

    @Test
    public void whoisInternalUserInfoMustReturnValue() {
        final UserInfoResponse mockedUserInfoData = AbstractIntegrationTest.getResource("mock/user-info.json", UserInfoResponse.class);

        when(request.getRemoteAddr()).thenReturn("");
        when(whoisInternalService.getUserInfo("")).thenReturn(mockedUserInfoData);

        final ResponseEntity<?> response = subject.whoisInternalUserInfo(request);

        verify(whoisInternalService, Mockito.times(1)).getUserInfo("");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockedUserInfoData, response.getBody());
    }

    @Test
    public void whoisInternalUserInfoMustReturnUnauthorisedWhenTokenMissing() {
        when(request.getRemoteAddr()).thenReturn("");
        when(whoisInternalService.getUserInfo(""))
                .thenThrow(new RestClientException(HttpStatus.UNAUTHORIZED.value(), "Unauthorized"));

        final ResponseEntity<?> response = subject.whoisInternalUserInfo(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    public void whoisInternalGetApiKeys() {
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        subject.getApiKeys(request, "", httpHeaders);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
    @Test
    public void whoisInternalSaveApiKey() {
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        subject.saveApiKey(request, "", httpHeaders, null);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
    @Test
    public void whoisInternalDeleteApiKeys() {
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        subject.deleteApiKeys(request, "", httpHeaders);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
    @Test
    public void whoisInternalGetIpAnalyser() {
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        subject.getIpAnalyser(request, "", "", httpHeaders);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
}
