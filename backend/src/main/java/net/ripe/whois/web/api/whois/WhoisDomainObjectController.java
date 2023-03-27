package net.ripe.whois.web.api.whois;

import com.google.common.collect.Lists;
import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.whois.services.WhoisDomainObjectService;
import net.ripe.whois.web.api.ApiController;
import net.ripe.whois.web.api.whois.domain.NameValuePair;
import net.ripe.whois.web.api.whois.domain.WhoisWebDTO;
import org.apache.commons.lang.StringUtils;
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

import javax.servlet.http.HttpServletResponse;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.List;

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

    private String getHostname() {
        String hostname = "unknown-host";
        try {
            final InetAddress addr = InetAddress.getLocalHost();
            final String fullHostname = addr.getHostName();
            final int indexFirstDot = fullHostname.indexOf('.');

            hostname = indexFirstDot != -1 ? StringUtils.left(fullHostname, indexFirstDot) : fullHostname;
        } catch (UnknownHostException ex) {
            LOGGER.error("Hostname can not be resolved", ex);
        }
        return hostname;
    }

    @RequestMapping(value = "/{source}", method = RequestMethod.POST)
    public ResponseEntity create(
            final HttpServletResponse response,
            @RequestBody final WhoisWebDTO dto,
            @PathVariable final String source,
            @RequestHeader final HttpHeaders headers) {

        LOGGER.debug("create domain objects {}", source);

        if (batchUpdateSession.getStatus() == WAITING_FOR_RESPONSE) {
            return new ResponseEntity<>("Still busy processing a previous request!", HttpStatus.TOO_MANY_REQUESTS);
        }

        final List<WhoisObject> domainObjects = Lists.newArrayList();

        for (String zone: dto.getValues(NameValuePair.NAME_REVERSE_ZONE)) {

            WhoisObject domainObject = new WhoisObject();
            domainObject.setType(NameValuePair.NAME_DOMAIN);

            List<Attribute> attributes = Lists.newArrayList();
            attributes.add(new Attribute(NameValuePair.NAME_DOMAIN, zone));
            attributes.addAll(dto.extractWhoisAttributesExcludeNames(NameValuePair.NAME_REVERSE_ZONE, NameValuePair.NAME_PREFIX));

            domainObject.setAttributes(attributes);
            domainObjects.add(domainObject);
        }
        headers.remove(com.google.common.net.HttpHeaders.HOST);

        batchUpdateSession.setResponseFuture(whoisDomainObjectService.createDomainObjects(source, dto.passwords, domainObjects, headers));

        return new ResponseEntity(HttpStatus.OK);
    }

}
