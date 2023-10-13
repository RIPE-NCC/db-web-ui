package net.ripe.whois.web.api.rest;

import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.services.WhoisRestService;
import net.ripe.whois.web.api.ApiController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Nullable;

@RestController
@RequestMapping("/api/rest")
@SuppressWarnings("UnusedDeclaration")
public class WhoisRestController extends ApiController {

    private final WhoisRestService whoisRestService;
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisRestController.class);

    @Autowired
    public WhoisRestController(final WhoisRestService whoisRestService) {
        this.whoisRestService = whoisRestService;
    }

    @GetMapping(value = "/**", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> getProxyRestCalls(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) throws Exception {
        return this.proxyRestCalls(request, body, headers);
    }

    @RequestMapping(value = "/**", method = {RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE}, produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> proxyRestCalls(
            final HttpServletRequest request,
            @Nullable @RequestBody(required = false) final String body,
            @RequestHeader final HttpHeaders headers) throws Exception {
        headers.set(HttpHeaders.CONNECTION, "Close");
        removeUnnecessaryHeaders(headers);
        return whoisRestService.bypass(request, body, headers);
    }
}
