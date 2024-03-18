package net.ripe.whois;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.UnsubscribeEmailController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UnsubscribeEmailControllerTest {

    private static final String MESSAGE_ID = "rRrR5L8b9zksKdrl6r1zYg00@ripe.net";
    @Mock
    private WhoisInternalService whoisInternalService;
    private UnsubscribeEmailController subject;

    @BeforeEach
    public void setup() throws IOException {
        subject = new UnsubscribeEmailController(whoisInternalService);
    }

    @Test
    public void success() {
        when(whoisInternalService.unSubscribe(MESSAGE_ID)).thenReturn(new ResponseEntity<>(HttpStatus.OK));
        final ResponseEntity<String> response = subject.unsubscribe(MESSAGE_ID);

        assertThat(response.getStatusCode(), is(HttpStatus.OK));
    }

    @Test
    public void failure() {
        when(whoisInternalService.unSubscribe(MESSAGE_ID)).thenThrow(new RestClientException(401, "Unauthorized"));
        assertThrows(RestClientException.class, () -> subject.unsubscribe(MESSAGE_ID));
    }

    @Test
    public void unsubscribeConfirm() {
        final String response = subject.unsubscribeConfirm(MESSAGE_ID);
        assertThat(response, is("redirect:/unsubscribe-confirm/rRrR5L8b9zksKdrl6r1zYg00@ripe.net"));
    }
}
