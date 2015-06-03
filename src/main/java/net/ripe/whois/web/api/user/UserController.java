package net.ripe.whois.web.api.user;

import com.google.common.collect.ImmutableMap;
import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import net.ripe.whois.external.clients.WhoisInternalClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import static org.springframework.http.ResponseEntity.ok;


@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private CrowdClient crowdClient;

    @Autowired
    private WhoisInternalClient whoisInternalClient;

    @RequestMapping(value = "/maintainers", method = RequestMethod.GET)
    public ResponseEntity<?> getMaintainers(@CookieValue(value = "crowd.token_key", required = true) final String crowdToken)throws Exception {

        final UUID uuid;
        try {
            final UserSession userSession = crowdClient.getUserSession(crowdToken);
            userSession.setUuid(crowdClient.getUuid(userSession.getUsername()));
            uuid = UUID.fromString(userSession.getUuid());
        } catch (CrowdClientException e){
            return new ResponseEntity(HttpStatus.NOT_FOUND);
        }

        return ok(whoisInternalClient.getMaintainers(uuid));
    }
}
