package net.ripe.whois.web.api.whois;

import com.google.common.base.Strings;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.ApiController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Nullable;
import javax.servlet.http.HttpServletRequest;

import static net.ripe.whois.CrowdTokenFilter.CROWD_TOKEN_KEY;

@RestController
@RequestMapping("/api/whois-internal")
@SuppressWarnings("UnusedDeclaration")
public class WhoisInternalProxyController extends ApiController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisInternalProxyController.class);

    private final WhoisInternalService whoisInternalService;

    @Autowired
    public WhoisInternalProxyController(final WhoisInternalService whoisInternalService) {
        this.whoisInternalService = whoisInternalService;
    }

    @RequestMapping(value = "/api/resources/**", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> findMyResources(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }


    @RequestMapping(value = "/api/fmp-pub/forgotmntnerpassword/{key}", method = RequestMethod.GET, produces = "application/pdf")
    @ResponseBody
    public ResponseEntity<byte[]> getForgotMaintainerPasswordPDF(final HttpServletRequest request,
                                                                 @PathVariable final String key,
                                                                 @RequestHeader final HttpHeaders headers) {

        LOGGER.info("Proxy call from db web ui getForgotMaintainerPasswordPDF {}", request.getRequestURI());
        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");
        removeUnnecessaryHeaders(headers);

        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");

        return whoisInternalService.bypassFile(request, "", headers);
    }

    @RequestMapping(value = "/api/fmp-pub/**")
    public ResponseEntity<String> forgotMaintainerPassword(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @RequestMapping(value = "/api/user/info", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> whoisInternalUserInfo(@CookieValue(value = CROWD_TOKEN_KEY, required=false) final String crowdToken) {

        if (Strings.isNullOrEmpty(crowdToken)){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        try{
            return ResponseEntity.ok().body(whoisInternalService.getUserInfo(crowdToken));
        } catch (RestClientException re){
            return new ResponseEntity<>(re.getMessage(), HttpStatus.valueOf(re.getStatus()));
        }
    }

    @RequestMapping(value = "/api/user/**")
    public ResponseEntity<String> whoisInternalUserProxy(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @RequestMapping(value = "/api/abuse-validation/validate-token")
    public ResponseEntity<String> whoisInternalValidateToken(
                final HttpServletRequest request,
            @RequestParam("token") final String token,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @PostMapping(path = "/api/mntner-pair/**")
    public ResponseEntity<String> whoisInternalCreateMntnerPair(
                final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    // call backend (do not map arbitrary user-supplied paths directly!)
    private ResponseEntity<String> proxyRestCalls(final HttpServletRequest request,
                                                 @Nullable @RequestBody(required = false) final String body,
                                                 @RequestHeader final HttpHeaders headers) {
        LOGGER.info("Proxy call from db web ui {}", request.getRequestURI());
        // can't return the original response as it can container wrong headers for HTTP2
        ResponseEntity<String> response = whoisInternalService.bypass(request, body, cleanHeaders(headers));
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    private HttpHeaders cleanHeaders(final HttpHeaders headers){
        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");
        removeUnnecessaryHeaders(headers);
        return headers;
    }
}
