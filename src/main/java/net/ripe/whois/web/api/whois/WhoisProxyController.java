package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisService;
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
@RequestMapping("/api/whois")
public class WhoisProxyController extends ApiController {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisProxyController.class);

    @Autowired
    private WhoisService whoisService;

    @RequestMapping(value = "/**")
    public ResponseEntity<String> proxyRestCalls(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) throws Exception {

        LOGGER.info("whois-request: {}", request.toString());

        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");
        removeUnnecessaryHeaders(headers);

        return whoisService.bypass(request, body, headers);
    }
}
