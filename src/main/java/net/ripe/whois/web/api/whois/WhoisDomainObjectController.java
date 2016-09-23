package net.ripe.whois.web.api.whois;

import com.google.common.collect.Lists;
import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.whois.services.WhoisDomainObjectService;
import net.ripe.whois.web.api.ApiController;
import net.ripe.whois.web.api.whois.domain.NameValuePair;
import net.ripe.whois.web.api.whois.domain.WhoisWebDTO;
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
import java.util.List;

@RestController
@RequestMapping("/api/whois/domain-objects")
public class WhoisDomainObjectController extends ApiController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectController.class);

    @Autowired
    private WhoisDomainObjectService whoisDomainObjectService;

    @RequestMapping(value = "/{source}", method = RequestMethod.POST)
    public ResponseEntity<WhoisResources> create(
            @RequestBody final WhoisWebDTO dto,
            @PathVariable final String source,
            @RequestHeader final HttpHeaders headers) throws URISyntaxException {

        LOGGER.debug("create domain objects {}", source);

        final List<WhoisObject> domainObjects = Lists.newArrayList();

        for (String zone: dto.getValues(NameValuePair.NAME_REVERSE_ZONE)) {

            WhoisObject domainObject = new WhoisObject();
            domainObject.setType(NameValuePair.NAME_DOMAIN);

            List<Attribute> attributes = Lists.newArrayList();
            attributes.add(new Attribute(NameValuePair.NAME_DOMAIN, zone));
            attributes.add(new Attribute(NameValuePair.NAME_DESCRIPTION, String.format("Reverse delegation for %s", dto.getValue("prefix"))));
            attributes.addAll(dto.extractWhoisAttributesExcludeNames(NameValuePair.NAME_REVERSE_ZONE, NameValuePair.NAME_PREFIX));

            domainObject.setAttributes(attributes);
            domainObjects.add(domainObject);
        }
        headers.remove(com.google.common.net.HttpHeaders.HOST);
        return whoisDomainObjectService.createDomainObjects(source, domainObjects, headers);
    }
}
