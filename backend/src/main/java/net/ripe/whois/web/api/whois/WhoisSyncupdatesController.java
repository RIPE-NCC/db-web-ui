package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisSyncupdatesService;
import net.ripe.whois.web.api.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.net.URISyntaxException;

@RestController
@RequestMapping("/api/syncupdates")
public class WhoisSyncupdatesController extends ApiController {

    private final WhoisSyncupdatesService whoisSyncupdatesService;

    @Autowired
    public WhoisSyncupdatesController(
        final WhoisSyncupdatesService whoisSyncupdatesService) {
        this.whoisSyncupdatesService = whoisSyncupdatesService;
    }

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<String> proxyRestCalls(@RequestBody(required = true) final String body,
                                         @RequestHeader final HttpHeaders headers) throws URISyntaxException {
        removeUnnecessaryHeaders(headers);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return whoisSyncupdatesService.proxy(body, headers);
    }

}