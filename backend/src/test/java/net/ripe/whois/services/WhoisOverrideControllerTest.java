package net.ripe.whois.services;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.ripe.whois.web.api.whois.WhoisOverrideController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WhoisOverrideControllerTest {

    @Mock
    private WhoisService whoisService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private WhoisOverrideController controller;

    private HttpHeaders headers;

    private static final String WHOIS_OVERRIDE = "test-override";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(
            controller, "whoisOverride", WHOIS_OVERRIDE
        );
        ReflectionTestUtils.setField(
            controller, "noPasswordAuthPopup", true
        );

        headers = new HttpHeaders();
    }

    @Test
    void shouldAddOverrideParameterToGetRequest() {
        when(request.getQueryString()).thenReturn(null);
        when(request.getRequestURI())
            .thenReturn("/api/whois/override/test");

        ResponseEntity<String> expectedResponse =
            ResponseEntity.ok("result");

        when(whoisService.bypass(
            any(HttpServletRequest.class),
            same(response),
            eq(null),
            same(headers)
        )).thenReturn(expectedResponse);

        ResponseEntity<String> actualResponse =
            controller.getProxyOverrideRestCalls(
                request, response, null, headers
            );

        ArgumentCaptor<HttpServletRequest> captor =
            ArgumentCaptor.forClass(HttpServletRequest.class);

        verify(whoisService).bypass(
            captor.capture(), same(response), eq(null), same(headers)
        );

        HttpServletRequest wrappedRequest = captor.getValue();

        String expectedOverride = URLEncoder.encode(
            WHOIS_OVERRIDE + ",Automatically Added SSO {notify=false}",
            StandardCharsets.UTF_8
        );

        assertEquals(
            "override=" + expectedOverride,
            wrappedRequest.getQueryString()
        );

        assertEquals(
            "/api/whois/test",
            wrappedRequest.getRequestURI()
        );

        assertSame(expectedResponse, actualResponse);
    }

    @Test
    void shouldPreserveExistingQueryParametersOnGetRequest() {
        when(request.getQueryString())
            .thenReturn("source=RIPE&filter=active");

        when(whoisService.bypass(
            any(HttpServletRequest.class),
            same(response),
            eq(null),
            same(headers)
        )).thenReturn(ResponseEntity.ok("result"));

        controller.getProxyOverrideRestCalls(
            request, response, null, headers
        );

        ArgumentCaptor<HttpServletRequest> captor =
            ArgumentCaptor.forClass(HttpServletRequest.class);

        verify(whoisService).bypass(
            captor.capture(), same(response), eq(null), same(headers)
        );

        String expectedOverride = URLEncoder.encode(
            WHOIS_OVERRIDE + ",Automatically Added SSO {notify=false}",
            StandardCharsets.UTF_8
        );

        assertEquals(
            "source=RIPE&filter=active&override=" + expectedOverride,
            captor.getValue().getQueryString()
        );
    }

    @Test
    void shouldAddOverrideParameterWhenExistingQueryStringIsEmpty() {
        when(request.getQueryString()).thenReturn("");

        when(whoisService.bypass(
            any(HttpServletRequest.class),
            same(response),
            eq(null),
            same(headers)
        )).thenReturn(ResponseEntity.ok("result"));

        controller.getProxyOverrideRestCalls(
            request, response, null, headers
        );

        ArgumentCaptor<HttpServletRequest> captor =
            ArgumentCaptor.forClass(HttpServletRequest.class);

        verify(whoisService).bypass(
            captor.capture(), same(response), eq(null), same(headers)
        );

        String expectedOverride = URLEncoder.encode(
            WHOIS_OVERRIDE + ",Automatically Added SSO {notify=false}",
            StandardCharsets.UTF_8
        );

        assertEquals(
            "override=" + expectedOverride,
            captor.getValue().getQueryString()
        );
    }

    @Test
    void shouldDelegatePutRequestToWhoisService() {
        when(request.getQueryString()).thenReturn("source=RIPE");

        String body = "request body";
        ResponseEntity<String> expectedResponse =
            ResponseEntity.ok("updated");

        when(whoisService.bypass(
            any(HttpServletRequest.class),
            same(response),
            eq(body),
            same(headers)
        )).thenReturn(expectedResponse);

        ResponseEntity<String> actualResponse =
            controller.proxyOverrideRestCalls(
                request, response, body, headers
            );

        ArgumentCaptor<HttpServletRequest> captor =
            ArgumentCaptor.forClass(HttpServletRequest.class);

        verify(whoisService).bypass(
            captor.capture(), same(response), eq(body), same(headers)
        );

        assertEquals(
            "source=RIPE&override=" + URLEncoder.encode(
                WHOIS_OVERRIDE
                    + ",Automatically Added SSO {notify=false}",
                StandardCharsets.UTF_8
            ),
            captor.getValue().getQueryString()
        );

        assertSame(expectedResponse, actualResponse);
    }
}
