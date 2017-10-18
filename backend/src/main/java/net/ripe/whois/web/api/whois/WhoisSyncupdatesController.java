package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisSyncupdatesService;
import net.ripe.whois.web.api.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<String> update(@RequestBody(required = true) final String body) throws URISyntaxException {
        return whoisSyncupdatesService.update(body);
    }

}
