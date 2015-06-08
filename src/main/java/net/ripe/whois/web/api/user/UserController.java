package net.ripe.whois.web.api.user;

import net.ripe.db.whois.common.sso.CrowdClient;
import net.ripe.db.whois.common.sso.CrowdClientException;
import net.ripe.db.whois.common.sso.UserSession;
import net.ripe.whois.services.WhoisInternalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    public static final String REQUEST_USER = "requestUser";

    @Autowired
    private CrowdClient crowdClient;

    @Autowired
    private WhoisInternalService whoisInternalService;

    @RequestMapping(value = "/maintainers", method = RequestMethod.GET)
    public ResponseEntity<?> getMaintainers(HttpServletRequest request)throws Exception {

        final UUID uuid;
        try {
            String userName = getUserSession(request).getUsername();
            uuid = UUID.fromString(crowdClient.getUuid(userName));
        } catch (CrowdClientException e){
            return new ResponseEntity(HttpStatus.NOT_FOUND);
        }

        return whoisInternalService.getMaintainers(uuid);
    }

    public static void setUserSession(HttpServletRequest request, UserSession user) {
        request.setAttribute(REQUEST_USER, user);
    }

    private UserSession getUserSession(HttpServletRequest request) {
        return (UserSession) request.getAttribute(REQUEST_USER);
    }
}
