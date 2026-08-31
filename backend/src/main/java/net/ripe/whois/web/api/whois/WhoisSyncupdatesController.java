package net.ripe.whois.web.api.whois;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.services.WhoisSyncupdatesService;
import net.ripe.whois.web.api.ApiController;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/syncupdates")
public class WhoisSyncupdatesController extends ApiController {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisSyncupdatesController.class);

    private final WhoisSyncupdatesService whoisSyncupdatesService;
    private final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;

    @Autowired
    public WhoisSyncupdatesController(
        final WhoisSyncupdatesService whoisSyncupdatesService,
        final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager) {
        this.whoisSyncupdatesService = whoisSyncupdatesService;
        this.oAuth2AuthorizedClientManager = oAuth2AuthorizedClientManager;
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<String> proxyRestCalls(@RequestBody(required = true) final String body,
                                                 final HttpServletRequest request,
                                                 @RequestHeader final HttpHeaders headers,
                                                 Authentication authentication)  {
        LOGGER.info("Received request to proxy whois sync updates");
        final String bearerToken = extractBearerToken(request, authentication, oAuth2AuthorizedClientManager);
        if (StringUtils.isNotBlank(bearerToken)) {
            headers.setBearerAuth(bearerToken);
        }
        return whoisSyncupdatesService.proxy(body, request, headers, bearerToken);
    }
}
