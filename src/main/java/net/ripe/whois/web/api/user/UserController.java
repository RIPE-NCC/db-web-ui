package net.ripe.whois.web.api.user;

import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.ResponseEntity.ok;
import static org.springframework.http.ResponseEntity.status;


@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private CrowdClient crowdClient;

    @Autowired
    private WhoisInternalClient whoisInternalClient;

    @RequestMapping(value = "/maintainers", method = RequestMethod.GET)
    public ResponseEntity<WhoisResources> getMaintainers(@CookieValue(value = "crowd.token_key", required = true) final String crowdToken)throws Exception {
        final UserSession userSession;

        try {
            userSession = crowdClient.getUserSession(crowdToken);
            userSession.setUuid(crowdClient.getUuid(userSession.getUsername()));
        } catch (CrowdClientException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return ok(whoisInternalClient.getMaintainers(userSession.getUuid()));
    }
}
