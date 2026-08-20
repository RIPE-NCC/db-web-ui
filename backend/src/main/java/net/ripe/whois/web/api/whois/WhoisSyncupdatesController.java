package net.ripe.whois.web.api.whois;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.services.WhoisSyncupdatesService;
import net.ripe.whois.web.api.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/syncupdates")
public class WhoisSyncupdatesController extends ApiController {

    private final WhoisSyncupdatesService whoisSyncupdatesService;
    private final OAuth2AuthorizedClientService authorizedClientService;

    @Autowired
    public WhoisSyncupdatesController(
        final WhoisSyncupdatesService whoisSyncupdatesService,
        final OAuth2AuthorizedClientService authorizedClientService) {
        this.whoisSyncupdatesService = whoisSyncupdatesService;
        this.authorizedClientService = authorizedClientService;
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<String> proxyRestCalls(@RequestBody(required = true) final String body,
                                                 final HttpServletRequest request,
                                                 @RequestHeader final HttpHeaders headers,
                                                 @RegisteredOAuth2AuthorizedClient("keycloak")
                                                     Authentication authentication)  {

        String bearerToken = null;
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            OAuth2AuthorizedClient authorizedClient =
                    authorizedClientService.loadAuthorizedClient(
                    oauthToken.getAuthorizedClientRegistrationId(),
                    oauthToken.getName());
            bearerToken = authorizedClient.getAccessToken().getTokenValue();
        }
        return whoisSyncupdatesService.proxy(body, request, headers, bearerToken);
    }

}
