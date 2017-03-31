package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisService;
import net.ripe.whois.web.api.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/whois/hierarchy")
@SuppressWarnings("UnusedDeclaration")
public class WhoisHierarchyController extends ApiController {

    private final WhoisService whoisService;

    @Autowired
    public WhoisHierarchyController(final WhoisService whoisService) {
        this.whoisService = whoisService;
    }

    /* TODO RequestMapping fail to work with slashes inside of
       the path parameters, so we use query parameters for now */
    @RequestMapping(value = "/parents-of", method = RequestMethod.GET)
    public ResponseEntity getStatus(
        @RequestParam("type") final String type,
        @RequestParam("key") final String key,
        @RequestParam("org") final String org
        ) throws Exception {
        final List<String> pathToRoot = whoisService.getPathToRoot(type, key, org);
        return ResponseEntity.ok(pathToRoot);
    }
}
