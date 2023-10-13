package net.ripe.whois;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RemoteAddressFilterTest {

    @Mock
    private FilterChain filterChain;

    @Mock
    private MockHttpServletResponse response;

    private MockHttpServletRequest request;

    @InjectMocks
    private RemoteAddressFilter remoteAddressFilter;

    @BeforeEach
    public void setup() {
        request = new MockHttpServletRequest("GET", "/doit");
    }

    @Test
    void should_strip_parentheses() throws Exception {
        ArgumentCaptor<ServletRequest> captor = ArgumentCaptor.forClass(ServletRequest.class);
        request.setRemoteAddr("[127.0.0.1]");

        remoteAddressFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(captor.capture(), any());
        assertEquals("127.0.0.1", captor.getValue().getRemoteAddr());
    }

    @Test
    void should_not_alter_valid_addresses() throws Exception {
        ArgumentCaptor<ServletRequest> captor = ArgumentCaptor.forClass(ServletRequest.class);
        request.setRemoteAddr("127.0.0.1");

        remoteAddressFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(captor.capture(), any());
        assertEquals("127.0.0.1", captor.getValue().getRemoteAddr());
    }
}
