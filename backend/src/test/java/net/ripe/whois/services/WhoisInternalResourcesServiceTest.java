package net.ripe.whois.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
public class WhoisInternalResourcesServiceTest {

    // dummy test data
    private static final String API_URL = "http://localhost";
    private static final String API_KEY = "DB-WHOIS-fe91223ec3a27c24";
    private static final String CONTEXT_PATH = "/db-web-ui";

    private HttpServletRequest request;
    private HttpHeaders httpHeaders;
    private RestTemplate restTemplate;
    private WhoisInternalProxy whoisInternalProxy;
    private WhoisInternalResourcesService subject;
    private MockRestServiceServer mockServer;

    @BeforeEach
    public void setUp() {
        request = mock(HttpServletRequest.class);
        httpHeaders = new HttpHeaders();
        restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);
        whoisInternalProxy = new WhoisInternalProxy(CONTEXT_PATH);
        subject = new WhoisInternalResourcesService(restTemplate, whoisInternalProxy, API_URL, API_KEY);
    }

    @Test
    public void success_response() throws Exception {
        when(request.getRequestURI()).thenReturn(CONTEXT_PATH + "/api/random");
        when(request.getMethod()).thenReturn(HttpMethod.GET.name());
        mockServer.expect(
                requestTo(String.format("%s/api/random", API_URL)))
            .andRespond(
                withSuccess("{}", MediaType.APPLICATION_JSON));

        subject.bypass(request, null, httpHeaders);

        mockServer.verify();
    }

    @Test
    public void error_response() throws Exception {
        when(request.getRequestURI()).thenReturn(CONTEXT_PATH + "/api/random");
        when(request.getMethod()).thenReturn(HttpMethod.GET.name());
        mockServer.expect(
                requestTo(String.format("%s/api/random", API_URL)))
                .andRespond(
                        withServerError());

        subject.bypass(request, null, httpHeaders);

        mockServer.verify();
    }

}
