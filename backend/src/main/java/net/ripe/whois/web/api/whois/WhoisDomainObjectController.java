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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.QueryParam;
import java.net.InetAddress;
import java.net.URISyntaxException;
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
    private static final String NAME_SESSIONID_USED_FOR_STICKINESS = "JSESSIONID";

    @Autowired
    private BatchUpdateSession batchUpdateSession;

    @Autowired
    private WhoisDomainObjectService whoisDomainObjectService;

    @RequestMapping(value = "/{source}/status", method = RequestMethod.GET)
    public ResponseEntity getStatus(@PathVariable final String source) {

        switch (batchUpdateSession.getStatus()) {
            case DONE:
                return batchUpdateSession.getResponse();
            case WAITING_FOR_RESPONSE:
                return new ResponseEntity(PARTIAL_CONTENT);
            default: // case IDLE:
                return new ResponseEntity(NO_CONTENT);
        }
    }

    /**
     * @return concise name of the host this app is running on, e.g. 'wagyu' or 'hereford'
     */
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
            @CookieValue(value = NAME_SESSIONID_USED_FOR_STICKINESS, required = false) final String cookieUsedForStickinessOnly,
            @RequestBody final WhoisWebDTO dto,
            @PathVariable final String source,
            @QueryParam("password") final String[] passwords,
            @RequestHeader final HttpHeaders headers) throws URISyntaxException {

        LOGGER.debug("create domain objects {}", source);

        if (StringUtils.isEmpty(cookieUsedForStickinessOnly)) {
            /*
            This is a hacky way of telling our proxy server (apache) which host processed a request.
            The proxy is currently configured to provide sticky sessions for the host specified in
            a cookie named 'JSESSIONID'. This app also maintains HTTP sessions but the name of its session
            ID is deliberately changed to Application.WEB_SESSION_ID_NAME. This avoids session collisions
            with the 'old' DbWebApp query application. We should remove this hack when each app is
            deployed to its own server with its own proxy config.
            */
            final String sessionId = "routebackto." + getHostname();
            final Cookie stickyCookie = new Cookie(NAME_SESSIONID_USED_FOR_STICKINESS, sessionId);
            stickyCookie.setSecure(true);
            stickyCookie.setPath("/");

            LOGGER.debug("setting %s (routing cookie) to: %s", NAME_SESSIONID_USED_FOR_STICKINESS, sessionId);
            response.addCookie(stickyCookie);
        }

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

        batchUpdateSession.setResponseFuture(whoisDomainObjectService.createDomainObjects(source, passwords, domainObjects, headers));

        return new ResponseEntity(HttpStatus.OK);
    }

}
