package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisDomainObjectService;
import net.ripe.whois.web.api.ApiController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.net.URISyntaxException;

@RestController
@RequestMapping("/api/domain-objects")
public class WhoisDomainObjectController extends ApiController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectController.class);

    @Autowired
    private WhoisDomainObjectService whoisDomainObjectService;

    @RequestMapping(value = "/{source}", method = RequestMethod.POST)
    public ResponseEntity<String> create(@PathVariable String source,
                                         @RequestBody(required = true) final String body,
                                         @RequestHeader final HttpHeaders headers) throws URISyntaxException {

        LOGGER.debug("create domain objects {}", source);

        removeUnnecessaryHeaders(headers);

        return whoisDomainObjectService.createDomainObjects(source, body, headers);
    }
}
