package net.ripe.whois.web.api.whois;

import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.whois.services.WhoisReferencesService;
import net.ripe.whois.web.api.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.net.URISyntaxException;

@RestController
@RequestMapping("/api/references")
public class WhoisReferencesController extends ApiController {

    @Autowired
    private WhoisReferencesService whoisReferencesService;

    @Value("${ripe.search.queryUrl}")
    private String queryUrl;

    private int MAX_RESULT_NUMBER = 5;

    @RequestMapping(value = "/{source}/{objectType}/{name}", method = RequestMethod.GET)
    public ResponseEntity<String> search(@PathVariable String source, @PathVariable String objectType, @PathVariable String name,
                                         @RequestParam(value = "limit", required = false) Integer limit,
                                         @RequestHeader final HttpHeaders headers) throws URISyntaxException {
        removeUnnecessaryHeaders(headers);

        return whoisReferencesService.getReferences(source, objectType, name, limit, headers);
    }

    @RequestMapping(value = "/{source}/{objectType}", method = RequestMethod.POST)
    public ResponseEntity<String> create(@PathVariable String source,
                                         @RequestBody(required = true) final String body,
                                         @RequestHeader final HttpHeaders headers) throws URISyntaxException {
        removeUnnecessaryHeaders(headers);

        return whoisReferencesService.createReferencedObjects(source, body, headers);
    }

    @RequestMapping(value = "/{source}/{objectType}/{name}", method = RequestMethod.DELETE)
    public ResponseEntity<WhoisResources> delete(@PathVariable String source, @PathVariable String objectType, @PathVariable String name,
                                                 @RequestParam("reason") String reason, @RequestParam(value = "password", required = false) String password,
                                                 @RequestHeader final HttpHeaders headers) throws URISyntaxException {
        removeUnnecessaryHeaders(headers);

        return whoisReferencesService.deleteObjectAndReferences(source, objectType, name, reason, password, headers);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleAllExceptions() {
        // Nothing to do
    }
}
