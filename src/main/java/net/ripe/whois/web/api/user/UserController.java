package net.ripe.whois.web.api.user;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.services.crowd.CrowdClient;
import net.ripe.whois.services.crowd.CrowdClientException;
import net.ripe.whois.services.crowd.UserSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private CrowdClient crowdClient;

    @Autowired
    private WhoisInternalService whoisInternalService;

    @RequestMapping(value = "/mntners", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Map<String,Object>>> getMaintainersCompact(@CookieValue(value = "crowd.token_key", required = true) final String crowdToken) throws Exception {

        try {
            final UUID uuid;
            final UserSession userSession = crowdClient.getUserSession(crowdToken);
            uuid = UUID.fromString(crowdClient.getUuid(userSession.getUsername()));

            List<Map<String,Object>> response = whoisInternalService.getMaintainers(uuid);

            // Make sure essentials content-type is set
            final MultiValueMap<String, String> headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
            return new ResponseEntity<List<Map<String,Object>>>(response, headers, HttpStatus.OK);

        } catch (CrowdClientException e) {
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }  catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

