package net.ripe.whois.web.api.user;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
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

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

import static net.ripe.whois.SsoTokenFilter.SSO_TOKEN_KEY;

@RestController
@RequestMapping("/api/user")
@SuppressWarnings("UnusedDeclaration")
public class UserController {

    private final WhoisInternalService whoisInternalService;

    @Autowired
    public UserController(final WhoisInternalService whoisInternalService) {
        this.whoisInternalService = whoisInternalService;
    }

    @RequestMapping(value = "/mntners", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getMaintainersCompact(final HttpServletRequest request,
                                                @CookieValue(value = SSO_TOKEN_KEY) final String ssoToken) {

        UserInfoResponse userInfoResponse = whoisInternalService.getUserInfo(ssoToken, request.getRemoteAddr());

        try {
            final List<Map<String,Object>> response = whoisInternalService
                .getMaintainers(userInfoResponse.user.uuid, request.getRemoteAddr());

            // Make sure essentials content-type is set
            final MultiValueMap<String, String> headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

            return new ResponseEntity<>(response, headers, HttpStatus.OK);

        }  catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/info", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getUserInfo(final HttpServletRequest request,
                                      @CookieValue(value = SSO_TOKEN_KEY, required = false) final String ssoToken) {
        return new ResponseEntity<>(whoisInternalService.getUserInfo(ssoToken, request.getRemoteAddr()), HttpStatus.OK);
    }
}

