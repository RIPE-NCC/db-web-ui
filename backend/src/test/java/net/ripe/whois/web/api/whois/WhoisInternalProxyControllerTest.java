package net.ripe.whois.web.api.whois;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.AbstractIntegrationTest;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.OAuth2AccessToken;

import java.io.IOException;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WhoisInternalProxyControllerTest {

    private static final OAuth2AccessToken ACCESS_TOKEN = new OAuth2AccessToken(
        OAuth2AccessToken.TokenType.BEARER,
        "mock-access-token",
        Instant.now(),
        Instant.now().plusSeconds(3600)
    );

    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpHeaders httpHeaders;
    @Mock
    private WhoisInternalService whoisInternalService;
    @InjectMocks
    private WhoisInternalProxyController subject;
    @Mock
    private OAuth2AuthorizedClient authorizedClient;

    @Test
    public void whoisInternalUserInfoMustReturnValue() throws IOException {
        final UserInfoResponse mockedUserInfoData = AbstractIntegrationTest.getResource("mock/user-info.json", UserInfoResponse.class);

        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(request.getRemoteAddr()).thenReturn("");
        when(whoisInternalService.getUserInfo(ACCESS_TOKEN, "")).thenReturn(mockedUserInfoData);

        final ResponseEntity<?> response = subject.whoisInternalUserInfo(request, authorizedClient);

        verify(whoisInternalService, Mockito.times(1)).getUserInfo(ACCESS_TOKEN, "");
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockedUserInfoData, response.getBody());
    }

    @Test
    public void whoisInternalUserInfoMustReturnUnAuthorisedIfCookieIsEmpty() {
        final ResponseEntity<?> response = subject.whoisInternalUserInfo(request, authorizedClient);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(whoisInternalService, Mockito.never()).getUserInfo(null, "");
    }

    @Test
    public void whoisInternalUserInfoMustReturnUnAuthorisedIfCookieIsNull() {
        final ResponseEntity<?> response = subject.whoisInternalUserInfo(request, authorizedClient);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(whoisInternalService, Mockito.never()).getUserInfo(null, "");
    }

    @Test
    public void whoisInternalGetApiKeys() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        final ResponseEntity<?> response = subject.getApiKeys(request, "", httpHeaders, authorizedClient);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
    @Test
    public void whoisInternalSaveApiKey() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        final ResponseEntity<?> response = subject.saveApiKey(request, "", httpHeaders, authorizedClient, null);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
    @Test
    public void whoisInternalDeleteApiKeys() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        final ResponseEntity<?> response = subject.deleteApiKeys(request, "", httpHeaders, authorizedClient);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
    @Test
    public void whoisInternalGetIpAnalyser() {
        when(authorizedClient.getAccessToken()).thenReturn(ACCESS_TOKEN);
        when(whoisInternalService.bypass(request, "", httpHeaders)).thenReturn(ResponseEntity.ok().build());
        final ResponseEntity<?> response = subject.getIpAnalyser(request, "", "", httpHeaders, authorizedClient);
        verify(whoisInternalService, Mockito.times(1)).bypass(request, "", httpHeaders);
    }
}
