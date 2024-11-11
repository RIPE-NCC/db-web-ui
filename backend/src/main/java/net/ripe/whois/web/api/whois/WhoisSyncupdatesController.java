package net.ripe.whois.web.api.whois;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.services.WhoisSyncupdatesService;
import net.ripe.whois.web.api.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

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
                                                 final HttpServletRequest request,
                                                 @RequestHeader final HttpHeaders headers) throws URISyntaxException {
        return whoisSyncupdatesService.proxy(body, request, headers);
    }

}