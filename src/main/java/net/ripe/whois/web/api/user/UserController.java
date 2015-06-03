package net.ripe.whois.web.api.user;

import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.ResponseEntity.ok;


@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private CrowdClient crowdClient;

    @Autowired
    private WhoisInternalClient whoisInternalClient;

    @RequestMapping(value = "/maintainers", method = RequestMethod.GET)
    public ResponseEntity getMaintainers(@CookieValue(value = "crowd.token_key", required = true) final String crowdToken)throws Exception {
        final UserSession userSession;

        try {
            userSession = crowdClient.getUserSession(crowdToken);
            userSession.setUuid(crowdClient.getUuid(userSession.getUsername()));
        } catch (CrowdClientException e){
            return new ResponseEntity(HttpStatus.NOT_FOUND);
        }

        return ok(whoisInternalClient.getMaintainers(userSession.getUuid()));
    }
}
