package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisReferencesService;
import net.ripe.whois.web.api.ApiController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.net.URLDecoder;

@RestController
@RequestMapping("/api/references")
public class WhoisReferencesController extends ApiController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisReferencesController.class);

    private final WhoisReferencesService whoisReferencesService;
    private final String queryUrl;

    @Autowired
    public WhoisReferencesController(
        final WhoisReferencesService whoisReferencesService,
        @Value("${ripe.search.queryUrl}") final String queryUrl) {
        this.whoisReferencesService = whoisReferencesService;
        this.queryUrl = queryUrl;
    }


    @RequestMapping(value = "/{source}/{objectType}/{name:.*}", method = RequestMethod.GET)
    public ResponseEntity<String> search(@PathVariable String source, @PathVariable String objectType, @PathVariable String name,
                                         @RequestParam(value = "limit", required = false) Integer limit,
                                         @RequestHeader final HttpHeaders headers) throws URISyntaxException, UnsupportedEncodingException {

        /*
         * TODO [MG]:
         * Looks like RequestMapping cannot handle path parameters that contain a single-escaped forward-slash (so containing '%2F').
         * Using double url-encoding (into %252F) the RequestMapping-pattern is being matched and this method is being called
         * As a consequence we have to decode the parameter before passing it on to whois
         */
        final String decodedName = URLDecoder.decode(name, "UTF-8");
        LOGGER.debug("search {} {} {}->{}", source, objectType, name, decodedName);

        removeUnnecessaryHeaders(headers);

        return whoisReferencesService.getReferences(source, objectType, decodedName, limit, headers);
    }

    @RequestMapping(value = "/{source}", method = RequestMethod.POST)
    public ResponseEntity<String> create(@PathVariable String source,
                                         @RequestBody(required = true) final String body,
                                         @RequestHeader final HttpHeaders headers) throws URISyntaxException {
        LOGGER.debug("create {}", source);
        removeUnnecessaryHeaders(headers);

        return whoisReferencesService.createReferencedObjects(source, body, headers);
    }

    @RequestMapping(value = "/{source}/{objectType}/{name:.*}", method = RequestMethod.DELETE)
    public ResponseEntity<String> delete(@PathVariable String source, @PathVariable String objectType, @PathVariable String name,
                                                 @RequestParam("reason") String reason, @RequestParam(value = "password", required = false) String password,
                                                 @RequestHeader final HttpHeaders headers) throws URISyntaxException, UnsupportedEncodingException {
        LOGGER.debug("delete {} {} {}", source, objectType, name);

        removeUnnecessaryHeaders(headers);

        return whoisReferencesService.deleteObjectAndReferences(source, objectType, name, reason, password, headers);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleAllExceptions() {
        // Nothing to do
    }
}
