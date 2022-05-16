package net.ripe.whois.web.api.baapps;

import com.google.common.base.Strings;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.common.ip.IpInterval;
import net.ripe.db.whois.common.rpsl.AttributeType;
import net.ripe.db.whois.common.rpsl.ObjectType;
import net.ripe.db.whois.common.rpsl.attrs.AttributeParseException;
import net.ripe.db.whois.common.rpsl.attrs.AutNum;
import net.ripe.whois.services.RsngService;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

import static net.ripe.whois.CrowdTokenFilter.CROWD_TOKEN_KEY;


@RestController
@RequestMapping("/api/ba-apps")
@SuppressWarnings("UnusedDeclaration")
public class BaAppsController {

    private final RsngService rsngService;
    private final ResourceTicketService resourceTicketService;
    private final WhoisInternalService whoisInternalService;

    @Autowired
    public BaAppsController(final RsngService rsngService,
                            final ResourceTicketService resourceTicketService,
                            final WhoisInternalService whoisInternalService) {
        this.rsngService = rsngService;
        this.resourceTicketService = resourceTicketService;
        this.whoisInternalService = whoisInternalService;
    }

    @RequestMapping(value = "/resources/{orgId}/{resource:.+}/{prefix:.+}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getTicketsPrefix(final HttpServletRequest request,
                                           @CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken,
                                           @PathVariable(name = "orgId") String orgIdIn,
                                           @PathVariable(name = "resource") String resourceIn,
                                           @PathVariable(name = "prefix") String prefix) {
        return getTickets(request, crowdToken, orgIdIn, resourceIn + "/" + prefix);
    }

    @RequestMapping(value = "/resources/{orgId}/{resource:.+}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getTickets(final HttpServletRequest request,
                                     @CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken,
                                     @PathVariable(name = "orgId") String orgId,
                                     @PathVariable(name = "resource") String resource) {

        if (Strings.isNullOrEmpty(crowdToken)){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        try {
            validateOrgId(orgId);
            validateResource(resource);
            UserInfoResponse userInfo = whoisInternalService.getUserInfo(crowdToken, request.getRemoteAddr());
            // orgObjectId can be null in FYI pseudo-LIRs objects
            final Optional<UserInfoResponse.Member> member = userInfo.members.stream()
                .filter(searchMember -> searchMember.orgObjectId != null && searchMember.orgObjectId.equals(orgId))
                .findFirst();

            if (member.isEmpty()) {
                // either end-user org or lir has no access
                return new ResponseEntity(HttpStatus.OK);
            }

            final ResourceTicketMap resourceTicketMap = resourceTicketService.getTicketsForMember(member.get().membershipId);
            final ResourceTicketResponse filtered = resourceTicketService.filteredResponse(resource.trim(), resourceTicketMap);
            return new ResponseEntity<>(filtered, HttpStatus.OK);
        } catch (JSONException e) {
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (RestClientException | IllegalArgumentException | IllegalAccessError e) {
            return new ResponseEntity(HttpStatus.FORBIDDEN);
        }
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

