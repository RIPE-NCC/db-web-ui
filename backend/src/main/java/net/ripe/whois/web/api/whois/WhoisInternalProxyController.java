package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.ApiController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Nullable;
import javax.servlet.http.HttpServletRequest;

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

    @RequestMapping(value = "/api/resources/**")
    public ResponseEntity<String> findMyResources(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @RequestMapping(value = "/api/fmp-pub/**")
    public ResponseEntity<String> forgotMaintainerPassword(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    @RequestMapping(value = "/api/user/**")
    public ResponseEntity<String> whoisInternalUserInfo(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {
        return proxyRestCalls(request, body, headers);
    }

    // call backend (do not map arbitrary user-supplied paths directly!)
    private ResponseEntity<String> proxyRestCalls(final HttpServletRequest request,
                                                 @Nullable @RequestBody(required = false) final String body,
                                                 @RequestHeader final HttpHeaders headers) {
        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");
        removeUnnecessaryHeaders(headers);
        return whoisInternalService.bypass(request, body, headers);
    }
}
