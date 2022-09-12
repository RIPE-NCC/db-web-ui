package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisService;
import net.ripe.whois.web.api.ApiController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Nullable;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/whois")
@SuppressWarnings("UnusedDeclaration")
public class WhoisProxyController extends ApiController {

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisProxyController.class);
    private final WhoisService whoisService;

    @Autowired
    public WhoisProxyController(final WhoisService whoisService) {
        this.whoisService = whoisService;
    }

    @RequestMapping(value = "/**", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> proxyRestCalls(
            final HttpServletRequest request,
            final HttpServletResponse response,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) {

        removeUnnecessaryHeaders(headers);

        return whoisService.bypass(request, response, body, headers);
    }
}
