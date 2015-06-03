package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.WhoisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/whois")
public class WhoisProxyController {

    @Autowired
    private WhoisService whoisService;

    @RequestMapping(value = "/**")
    public ResponseEntity<String> proxyRestCalls(final HttpServletRequest request, @RequestBody final String body, @RequestHeader HttpHeaders headers) throws Exception {

        headers.set(com.google.common.net.HttpHeaders.CONNECTION, "Close");

        return whoisService.bypass(request, body, headers);
    }
}
