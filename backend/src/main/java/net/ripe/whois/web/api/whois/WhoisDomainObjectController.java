package net.ripe.whois.web.api.whois;

import com.google.common.collect.Lists;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.whois.services.WhoisDomainObjectService;
import net.ripe.whois.web.api.ApiController;
import net.ripe.whois.web.api.whois.domain.NameValuePair;
import net.ripe.whois.web.api.whois.domain.WhoisWebDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import static net.ripe.whois.web.api.whois.BatchStatus.WAITING_FOR_RESPONSE;
import static org.springframework.http.HttpStatus.NO_CONTENT;
import static org.springframework.http.HttpStatus.PARTIAL_CONTENT;

@RestController
@RequestMapping("/api/whois/domain-objects")
@SuppressWarnings("UnusedDeclaration")
public class WhoisDomainObjectController extends ApiController {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectController.class);

    private final BatchUpdateSession batchUpdateSession;

    private final WhoisDomainObjectService whoisDomainObjectService;

    @Autowired
    public WhoisDomainObjectController(final BatchUpdateSession batchUpdateSession, final WhoisDomainObjectService whoisDomainObjectService) {
        this.batchUpdateSession = batchUpdateSession;
        this.whoisDomainObjectService = whoisDomainObjectService;
    }

    @RequestMapping(value = "/{source}/status", method = RequestMethod.GET, produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity getStatus(@PathVariable final String source) {
        switch (batchUpdateSession.getStatus()) {
            case DONE:
                // can't return the original response as it can container wrong headers for HTTP2
                ResponseEntity response = batchUpdateSession.getResponse();
                return new ResponseEntity<>(response.getBody(), response.getStatusCode());
            case WAITING_FOR_RESPONSE:
                return new ResponseEntity<>(PARTIAL_CONTENT);
            default: // case IDLE:
                return new ResponseEntity<>(NO_CONTENT);
        }
    }

    @RequestMapping(value = "/{source}", method = RequestMethod.POST)
    public ResponseEntity<String> create(
            final HttpServletRequest request,
            final HttpServletResponse response,
            @RequestBody final WhoisWebDTO dto,
            @PathVariable final String source) {

        LOGGER.debug("create domain objects {}", source);

        if (batchUpdateSession.getStatus() == WAITING_FOR_RESPONSE) {
            return new ResponseEntity<>("Still busy processing a previous request!", HttpStatus.TOO_MANY_REQUESTS);
        }

        final List<WhoisObject> domainObjects = Lists.newArrayList();
        for (String zone: dto.getValues(NameValuePair.NAME_REVERSE_ZONE)) {
            final WhoisObject domainObject = new WhoisObject();
            domainObject.setType(NameValuePair.NAME_DOMAIN);
            final List<Attribute> attributes = Lists.newArrayList();
            attributes.add(new Attribute(NameValuePair.NAME_DOMAIN, zone));
            attributes.addAll(dto.getAttributesExcluding(NameValuePair.NAME_REVERSE_ZONE, NameValuePair.NAME_PREFIX));
            domainObject.setAttributes(attributes);
            domainObjects.add(domainObject);
        }

        batchUpdateSession.setResponseFuture(
            whoisDomainObjectService.createDomainObjects(
                source,
                dto.passwords,
                domainObjects,
                request.getRemoteAddr(),
                request.getHeader(HttpHeaders.COOKIE)));

        return new ResponseEntity<>(HttpStatus.OK);
    }

}
