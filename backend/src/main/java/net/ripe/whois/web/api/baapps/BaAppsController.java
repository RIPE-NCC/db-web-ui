package net.ripe.whois.web.api.baapps;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.common.ip.IpInterval;
import net.ripe.db.whois.common.rpsl.AttributeType;
import net.ripe.db.whois.common.rpsl.ObjectType;
import net.ripe.db.whois.common.rpsl.attrs.AttributeParseException;
import net.ripe.db.whois.common.rpsl.attrs.AutNum;
import net.ripe.whois.services.BaAppsService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import static net.ripe.whois.CrowdTokenFilter.CROWD_TOKEN_KEY;


@RestController
@RequestMapping("/api/ba-apps")
@SuppressWarnings("UnusedDeclaration")
public class BaAppsController {

    private final BaAppsService baAppsService;
    private final ResourceTicketService resourceTicketService;

    @Autowired
    public BaAppsController(final BaAppsService baAppsService, final ResourceTicketService resourceTicketService) {
        this.baAppsService = baAppsService;
        this.resourceTicketService = resourceTicketService;
    }

    @RequestMapping(value = "/lirs", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getLirs(@CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken) {
        try {
            final String json = baAppsService.getLirs(crowdToken);
            return new ResponseEntity<>(json, HttpStatus.OK);
        } catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/organisations", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getOrganisations(@CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken) {
        try {
            final String json = baAppsService.getOrganisations(crowdToken);
            return new ResponseEntity<>(json, HttpStatus.OK);
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
                                     @PathVariable(name = "orgId") String orgId,
                                     @PathVariable(name = "resource") String resource) {
        try {
            validateOrgId(orgId);
            validateResource(resource);
            final String jsonLirs = baAppsService.getLirs(crowdToken);
            final String memberId = findMemberIdFromLirs(orgId.trim(), jsonLirs);
            if (memberId.length() == 0) {
                // either end-user org or lir has no access
                return new ResponseEntity(HttpStatus.OK);
            }
            final ResourceTicketMap resourceTicketMap = resourceTicketService.getTicketsForMember(memberId);
            final ResourceTicketResponse filtered = resourceTicketService.filteredResponse(resource.trim(), resourceTicketMap);
            return new ResponseEntity<>(filtered, HttpStatus.OK);
        } catch (JSONException e) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RestClientException | IllegalArgumentException | IllegalAccessError e) {
            return new ResponseEntity(HttpStatus.FORBIDDEN);
        }
    }

    // find memberId for selected organisation
    private String findMemberIdFromLirs(final String orgId, final String jsonLirs) throws JSONException {
        final JSONObject lirsResponse = new JSONObject(jsonLirs);
        final JSONArray lirs = lirsResponse.getJSONObject("response").getJSONArray("results");
        // check that the orgId is in 'results'
        for (int i = 0; i < lirs.length(); i++) {
            if (orgId.equals(lirs.getJSONObject(i).getString("orgId"))) {
                return lirs.getJSONObject(i).getString("membershipId");
            }
        }
        return "";
    }

    private static void validateOrgId(final String orgId) {
        if (!isValidOrgId(orgId)) {
            throw new IllegalArgumentException("Invalid org-id " + orgId);
        }
    }

    private static void validateResource(final String resource) {
        if (!isValidIp(resource) && !isValidAutnum(resource)) {
            throw new IllegalArgumentException("Invalid resource " + resource);
        }
    }

    private static boolean isValidIp(final String key) {
        try {
            IpInterval.parse(key);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static boolean isValidAutnum(final String key) {
        try {
            AutNum.parse(key);
            return true;
        } catch (AttributeParseException e) {
            return false;
        }
    }

    private static boolean isValidOrgId(final String key) {
        return AttributeType.ORGANISATION.isValidValue(ObjectType.ORGANISATION, key);
    }
}

