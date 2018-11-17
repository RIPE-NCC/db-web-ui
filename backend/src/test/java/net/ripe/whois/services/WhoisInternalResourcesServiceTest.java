package net.ripe.whois.services;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RunWith(MockitoJUnitRunner.class)
public class WhoisInternalResourcesServiceTest {

    // dummy test data
    private static final String API_URL = "http://localhost";
    private static final String API_KEY = "DB-WHOIS-fe91223ec3a27c24";
    private static final String CONTEXT_PATH = "/db-web-ui";

    private HttpServletRequest request;
    private HttpHeaders httpHeaders;
    private RestTemplate restTemplate;
    private WhoisProxyUrl whoisProxyUrl;
    private WhoisInternalResourcesService subject;
    private MockRestServiceServer mockServer;

    @Before
    public void setUp() {
        request = mock(HttpServletRequest.class);
        httpHeaders = new HttpHeaders();
        restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);
        whoisProxyUrl = new WhoisProxyUrl(CONTEXT_PATH);
        subject = new WhoisInternalResourcesService(restTemplate, whoisProxyUrl, API_URL, API_KEY);
    }

    @Test
    public void success_response() throws Exception {
        when(request.getRequestURI()).thenReturn(CONTEXT_PATH + "/api/random");
        when(request.getMethod()).thenReturn(HttpMethod.GET.name());
        mockServer.expect(
                requestTo(String.format("%s/api/random?apiKey=%s", API_URL, API_KEY)))
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
                requestTo(String.format("%s/api/random?apiKey=%s", API_URL, API_KEY)))
                .andRespond(
                        withServerError());

        subject.bypass(request, null, httpHeaders);

        mockServer.verify();
    }

}
