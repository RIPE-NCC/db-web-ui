package net.ripe.whois.web.api.whois;

import com.google.common.collect.Lists;
import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.whois.services.WhoisDomainObjectService;
import net.ripe.whois.web.api.ApiController;
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

    @RequestMapping(value = "/{source}", method = RequestMethod.POST) /*, consumes = MediaType.APPLICATION_JSON_VALUE*/
    public ResponseEntity<String> create(
            @RequestBody final WhoisWebDTO dto,
            @PathVariable final String source,
            @RequestHeader final HttpHeaders headers) throws URISyntaxException {

        LOGGER.debug("create domain objects {}", source);

        final List<WhoisObject> domainObjects = Lists.newArrayList();

        for (String zone: dto.getValuesForName("reverse-zone")) {

            WhoisObject domainObject = new WhoisObject();

            List<Attribute> attributes = Lists.newArrayList();
            attributes.add(new Attribute("domain", zone));
            attributes.addAll(dto.extractWhoisAttributesExcludeNames("reverse-zone", "prefix"));

            domainObject.setAttributes(attributes);
            domainObjects.add(domainObject);
        }

        return whoisDomainObjectService.createDomainObjects(source, domainObjects, headers);
    }
}
