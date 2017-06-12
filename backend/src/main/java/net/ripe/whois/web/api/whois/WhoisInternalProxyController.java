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

// TODO: [ES] bypass() mapping below is very dangerous, and allows direct user access to any whois-internal API with a matching db-web-ui api key.
//            For example:
//                  /api/fmp-pub,
//                  /api/fmp-int,
//                  /api/user
//                  /api/resources
//      We need to replace aribitrary URL access, with explicit mappings for any APIs that we want to allow.
//
//
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

    @RequestMapping(value = "/**")
    public ResponseEntity<String> proxyRestCalls(final HttpServletRequest request,
                                                 @Nullable @RequestBody(required = false) final String body,
                                                 @RequestHeader final HttpHeaders headers) throws Exception {

        LOGGER.debug("whois-internal request: {}", request.toString());

        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");
        removeUnnecessaryHeaders(headers);

        return whoisInternalService.bypass(request, body, headers);
    }
}
