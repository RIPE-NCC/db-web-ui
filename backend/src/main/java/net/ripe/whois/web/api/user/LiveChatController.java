package net.ripe.whois.web.api.user;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
public class LiveChatController {

    private static final Logger LOGGER = LoggerFactory.getLogger(LiveChatController.class);

    private final RestClient oauth2RestClient;

    private final String livechatUrl;

    @Autowired
    public LiveChatController(final RestClient oauth2RestClient,
                              final @Value("${live.chat.api.url:}") String livechatUrl) {
        this.oauth2RestClient = oauth2RestClient;
        this.livechatUrl = livechatUrl;
    }

    @GetMapping("/api/zendesk-chat-token")
    public String getZendeskChatToken() {
        LOGGER.info("Getting Zendesk Chat Token");
        return oauth2RestClient.get()
                .uri(livechatUrl)
                .retrieve()
                .body(String.class);
    }
}
