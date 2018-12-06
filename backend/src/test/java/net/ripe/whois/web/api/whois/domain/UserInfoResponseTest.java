package net.ripe.whois.web.api.whois.domain;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.Resources;
import org.junit.Test;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.charset.Charset;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;

public class UserInfoResponseTest {

    @Test
    public void test() throws IOException {
        String response = Resources.toString(Resources.getResource("mock/user-info.json"), Charset.defaultCharset());

        try {
            UserInfoResponse userInfoResponse = (new ObjectMapper()).readValue(response, UserInfoResponse.class);
            assertThat(userInfoResponse.user.username, is("test@ripe.net"));
        } catch (Exception e) {
            assertNull(e);
            System.out.println(e.getMessage());
        }

    }


}
