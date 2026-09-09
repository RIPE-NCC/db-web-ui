package net.ripe.whois.web.api.user;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.OidcAbstractController;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@SuppressWarnings("UnusedDeclaration")
public class UserController extends OidcAbstractController {

    private final WhoisInternalService whoisInternalService;

    @Autowired
    public UserController(final WhoisInternalService whoisInternalService,
                          final OAuth2AuthorizedClientManager oAuth2AuthorizedClientManager) {
        super(oAuth2AuthorizedClientManager);
        this.whoisInternalService = whoisInternalService;
    }

    @RequestMapping(value = "/mntners", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getMaintainersCompact(final HttpServletRequest request,
                                                final Authentication authentication) {
        final String bearerToken = extractBearerToken(request, authentication);
        final UserInfoResponse userInfoResponse = whoisInternalService.getUserInfo(bearerToken, request.getRemoteAddr());

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
                                      final Authentication authentication) {
        final String bearerToken = extractBearerToken(request, authentication);
        return new ResponseEntity<>(whoisInternalService.getUserInfo(bearerToken, request.getRemoteAddr()), HttpStatus.OK);
    }
}

