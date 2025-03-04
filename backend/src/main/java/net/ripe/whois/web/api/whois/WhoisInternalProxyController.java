package net.ripe.whois.web.api.whois;

import com.google.common.base.Strings;
import jakarta.servlet.http.HttpServletRequest;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

import static net.ripe.whois.SsoTokenFilter.SSO_TOKEN_KEY;

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

    @GetMapping(path = "/public/lir/{orgId}/mntner", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<?> getDefaultMaintainer(
            final HttpServletRequest request,
            @PathVariable final String orgId,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @PostMapping(path = "/public/unsubscribe", consumes = {MediaType.TEXT_PLAIN_VALUE}, produces = {MediaType.TEXT_PLAIN_VALUE})
    public ResponseEntity<String> whoisInternalUnsubscribe(
        final HttpServletRequest request,
        @Nullable @RequestBody(required = false) final String body,
        @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @GetMapping(path = "/public/unsubscribe", consumes = {MediaType.TEXT_PLAIN_VALUE}, produces = {MediaType.TEXT_PLAIN_VALUE})
    public ResponseEntity<String> whoisInternalGetEmailFromMessageId(
        final HttpServletRequest request,
        @Nullable @RequestBody(required = false) final String body,
        @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @GetMapping(path = "/public/rpki/roa")
    public ResponseEntity<String> getRpkiRoa(
        final HttpServletRequest request,
        @RequestParam("origin") final String origin,
        @RequestParam("route") final String route,
        @Nullable @RequestBody(required = false) final String body,
        @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @GetMapping(path = "/public/api-key", consumes = {MediaType.APPLICATION_JSON_VALUE}, produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<?> getApiKeys(
        final HttpServletRequest request,
        @Nullable @RequestBody(required = false) final String body,
        @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @PostMapping(path = "/public/api-key", consumes = {MediaType.APPLICATION_JSON_VALUE}, produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<?> saveApiKey(
        final HttpServletRequest request,
        @Nullable @RequestBody(required = false) final String body,
        @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @DeleteMapping(path = "/public/api-key/{key}", consumes = {MediaType.APPLICATION_JSON_VALUE}, produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<?> deleteApiKeys(
        final HttpServletRequest request,
        @PathVariable final String key,
        @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, "", headers);
    }

    @GetMapping(path = "/api/resources/**", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> findMyResources(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }


    @GetMapping(path = "/api/fmp-pub/forgotmntnerpassword/{key}", produces = "application/pdf")
    @ResponseBody
    public ResponseEntity<byte[]> getForgotMaintainerPasswordPDF(final HttpServletRequest request,
                                                                 @PathVariable final String key,
                                                                 @RequestHeader final HttpHeaders headers) {

        LOGGER.debug("Proxy call from db web ui getForgotMaintainerPasswordPDF {}", request.getRequestURI());
        removeUnnecessaryHeaders(headers);

        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");

        return whoisInternalService.bypassFile(request, "", headers);
    }

    @GetMapping(value = "/api/fmp-pub/**")
    public ResponseEntity<String> getForgotMaintainerPassword(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @RequestMapping(value = "/api/fmp-pub/**", method = {RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
    public ResponseEntity<String> forgotMaintainerPassword(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @GetMapping(value = "/api/user/info", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> whoisInternalUserInfo(final HttpServletRequest request,
                                                   @CookieValue(value = SSO_TOKEN_KEY, required=false) final String ssoToken) {

        if (Strings.isNullOrEmpty(ssoToken)){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        try{
            return ResponseEntity.ok().body(whoisInternalService.getUserInfo(ssoToken, request.getRemoteAddr()));
        } catch (RestClientException re){
            return new ResponseEntity<>(re.getMessage(), HttpStatus.valueOf(re.getStatus()));
        }
    }

    @GetMapping(path = "/api/user/**")
    public ResponseEntity<String> whoisInternalUserProxy(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @GetMapping(value = "/api/abuse-validation/validate-token")
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
        LOGGER.debug("Proxy call from db web ui {}", request.getRequestURI());
        // can't return the original response as it can container wrong headers for HTTP2
        ResponseEntity<String> response = whoisInternalService.bypass(request, body, cleanHeaders(headers));
        return new ResponseEntity<>(response.getBody(), response.getStatusCode());
    }

    private HttpHeaders cleanHeaders(final HttpHeaders headers){
        removeUnnecessaryHeaders(headers);
        return headers;
    }
}
