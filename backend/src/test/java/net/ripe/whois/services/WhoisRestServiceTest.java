package net.ripe.whois.services;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class WhoisRestServiceTest {

    // dummy test data
    private static final String API_URL = "http://localhost";
    private static final String CONTEXT_PATH = "/db-web-ui";

    private HttpServletRequest request;
    private HttpHeaders httpHeaders;
    private RestTemplate restTemplate;
    private WhoisRestService subject;
    private String body;

    @Before
    public void setUp() {
        request = mock(HttpServletRequest.class);
        httpHeaders = new HttpHeaders();
        restTemplate = mock(RestTemplate.class);
        subject = new WhoisRestService(restTemplate, API_URL, CONTEXT_PATH);
        body = "";
    }

    @Test
    public void should_remove_context_path_and_api_rest() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/rest/fulltextsearch/select");
        when(request.getMethod()).thenReturn(HttpMethod.GET.name());
        subject.bypass(request, body, httpHeaders);

        verify(restTemplate).exchange(new URI("http://localhost/fulltextsearch/select"), HttpMethod.GET, new HttpEntity<>(body, httpHeaders), String.class);
    }

    @Test
    public void should_encode_query_parameters() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/rest/fulltextsearch/select");
        when(request.getQueryString()).thenReturn("q=<svg+onload=\"alert('XSS')\">");
        when(request.getMethod()).thenReturn(HttpMethod.GET.name());
        subject.bypass(request, body, httpHeaders);

        verify(restTemplate).exchange(new URI("http://localhost/fulltextsearch/select?q=%3Csvg+onload=%22alert('XSS')%22%3E"), HttpMethod.GET, new HttpEntity<>(body, httpHeaders), String.class);
    }
}
