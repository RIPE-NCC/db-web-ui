package net.ripe.whois.web.api.user;

import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import net.ripe.whois.services.WhoisInternalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;


@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private CrowdClient crowdClient;

    @Autowired
    private WhoisInternalService whoisInternalService;

    @RequestMapping(value = "/maintainers", method = RequestMethod.GET)
    public ResponseEntity<?> getMaintainers(@CookieValue(value = "crowd.token_key", required = true) final String crowdToken) throws Exception {

        final UUID uuid;
        try {
            final UserSession userSession = crowdClient.getUserSession(crowdToken);
            uuid = UUID.fromString(crowdClient.getUuid(userSession.getUsername()));
        } catch (CrowdClientException e) {
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }

        return whoisInternalService.getMaintainers(uuid);
    }

    @RequestMapping(value = "/mntners", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getMaintainersCompact(@CookieValue(value = "crowd.token_key", required = true) final String crowdToken) throws Exception {

        final UUID uuid;
        try {
            final UserSession userSession = crowdClient.getUserSession(crowdToken);
            uuid = UUID.fromString(crowdClient.getUuid(userSession.getUsername()));
        } catch (CrowdClientException e) {
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }

        return whoisInternalService.getMaintainersCompact(uuid);
    }

}

