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
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.QueryParam;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api/whois/domain-objects")
@SuppressWarnings("UnusedDeclaration")
public class WhoisDomainObjectController extends ApiController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectController.class);

    @Autowired
    private WhoisDomainObjectService whoisDomainObjectService;

    @RequestMapping(value = "/{source}", method = RequestMethod.POST)
    public ResponseEntity create(
            @RequestBody final WhoisWebDTO dto,
            @PathVariable final String source,
            @QueryParam("password") final String[] passwords,
            @RequestHeader final HttpHeaders headers) throws URISyntaxException {

        LOGGER.debug("create domain objects {}", source);

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
        return whoisDomainObjectService.createDomainObjects(source, passwords, domainObjects, headers);
    }
}
