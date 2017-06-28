package net.ripe.whois.web.api.baapps;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.BaAppsService;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.regex.Pattern;

import static net.ripe.whois.CrowdTokenFilter.CROWD_TOKEN_KEY;


@RestController
@RequestMapping("/api/ba-apps")
@SuppressWarnings("UnusedDeclaration")
public class BaAppsController {

    private final BaAppsService baAppsService;
    private final ResourceTicketService resourceTicketService;
    private static Pattern IP_ADDRESS_AND_ASN_NAME = Pattern.compile("^[a-zA-Z0-9:./ -]+$");

    @Autowired
    public BaAppsController(final BaAppsService baAppsService, final ResourceTicketService resourceTicketService) {
        this.baAppsService = baAppsService;
        this.resourceTicketService = resourceTicketService;
    }

    @RequestMapping(value = "/lirs", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getLirs(@CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken) {
        try {
            final String json = baAppsService.getLirs(crowdToken);
            return new ResponseEntity<>(json, headers(), HttpStatus.OK);
        } catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/organisations", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getOrganisations(@CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken) {
        try {
            final String json = baAppsService.getOrganisations(crowdToken);
            return new ResponseEntity<>(json, headers(), HttpStatus.OK);
        } catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/resources/{orgId}/{resource:.+}/{prefix:.+}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getTicketsPrefix(@CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken,
                                           @PathVariable(name = "orgId") String orgIdIn,
                                           @PathVariable(name = "resource") String resourceIn,
                                           @PathVariable(name = "prefix") String prefix) {
        return getTickets(crowdToken, orgIdIn, resourceIn + "/" + prefix);
    }

    @RequestMapping(value = "/resources/{orgId}/{resource:.+}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getTickets(@CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken,
                                     @PathVariable(name = "orgId") String orgIdIn,
                                     @PathVariable(name = "resource") String resourceIn) {
        try {
            final String orgId = sanitize(orgIdIn);
            final String resource = sanitize(resourceIn);
            final String jsonLirs = baAppsService.getLirs(crowdToken);
            final String memberId = resourceTicketService.findMemberIdFromLirs(orgId, jsonLirs);
            final ResourceTicketMap resourceTicketMap = resourceTicketService.getTicketsForMember(memberId);
            final ResourceTicketResponse filtered = resourceTicketService.filteredResponse(resource, resourceTicketMap);
            return new ResponseEntity<>(filtered, headers(), HttpStatus.OK);
        } catch (JSONException e) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RestClientException | IllegalArgumentException | IllegalAccessError e) {
            return new ResponseEntity(HttpStatus.FORBIDDEN);
        }
    }

    private static String sanitize(String strIn) {
        if (IP_ADDRESS_AND_ASN_NAME.matcher(strIn).matches()) {
            return strIn.trim();
        }
        throw new IllegalArgumentException("Unsupported input");
    }

    private static MultiValueMap<String, String> headers() {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }
}

