package net.ripe.whois.web.api.user;

import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import net.ripe.whois.services.WhoisInternalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private CrowdClient crowdClient;

    @Autowired
    private WhoisInternalService whoisInternalService;

    @RequestMapping(value = "/maintainers", method = RequestMethod.GET)
    public ResponseEntity<?> getMaintainers(@CookieValue(value = "crowd.token_key", required = true) final String crowdToken)throws Exception {

        final UUID uuid;
        try {
            final UserSession userSession = crowdClient.getUserSession(crowdToken);
            uuid = UUID.fromString(crowdClient.getUuid(userSession.getUsername()));
        } catch (CrowdClientException e){
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }

        return whoisInternalService.getMaintainers(uuid);
    }
}

