package net.ripe.whois.web.api.whois;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import net.ripe.whois.services.WhoisService;
import net.ripe.whois.web.api.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.annotation.Nullable;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import java.util.StringJoiner;

@RestController
@RequestMapping("/api/whois/override")
@SuppressWarnings("UnusedDeclaration")
public class WhoisOverrideController extends ApiController {

    private final WhoisService whoisService;

    @Value("${whois.override:}")
    private String whoisOverride;

    @Value("${nopassword.auth.popup:false}")
    private boolean noPasswordAuthPopup;

    @Autowired
    public WhoisOverrideController(final WhoisService whoisService) {
        this.whoisService = whoisService;
    }

    @GetMapping(value = "/**", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> getProxyOverrideRestCalls(
        final HttpServletRequest request,
        final HttpServletResponse response,
        @Nullable @RequestBody(required = false) final String body,
        @RequestHeader final HttpHeaders headers) {

        if (!noPasswordAuthPopup) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        OverrideHttpServletRequestWrapper wrappedRequest =
            new OverrideHttpServletRequestWrapper(request);

        removeUnnecessaryHeaders(headers);
        return whoisService.bypass(wrappedRequest, response, body, headers);
    }

    @RequestMapping(value = "/**", method = {RequestMethod.PUT}, produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> proxyOverrideRestCalls(
        final HttpServletRequest request,
        final HttpServletResponse response,
        @Nullable @RequestBody(required = false) final String body,
        @RequestHeader final HttpHeaders headers) {

        if (!noPasswordAuthPopup) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        OverrideHttpServletRequestWrapper wrappedRequest =
            new OverrideHttpServletRequestWrapper(request);

        removeUnnecessaryHeaders(headers);
        return whoisService.bypass(wrappedRequest, response, body, headers);
    }

    private class OverrideHttpServletRequestWrapper extends HttpServletRequestWrapper {

        public OverrideHttpServletRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getQueryString() {
            String superQueryString = super.getQueryString();
            String whoisQuery = "override="+URLEncoder.encode(whoisOverride+",Automatically Added SSO {notify=false}", StandardCharsets.UTF_8);
            return superQueryString == null || superQueryString.isEmpty() ? whoisQuery : new StringJoiner("&").add(superQueryString).add(whoisQuery).toString();
        }

        @Override
        public String getRequestURI() {
            return super.getRequestURI().replace("override/", "");
        }
    }
}
