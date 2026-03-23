package net.ripe.api.publicapi;

import com.google.common.collect.Maps;
import jakarta.servlet.http.HttpServletRequest;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.ApiController;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class PublicApiController extends ApiController {

    private final WhoisInternalService whoisInternalService;

    @Autowired
    public PublicApiController(final WhoisInternalService whoisInternalService) {
        this.whoisInternalService = whoisInternalService;
    }

    @RequestMapping(value = "/ipanalyser/v2/{ipv:ipv4|ipv6}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE})
    public ResponseEntity ipAnalyserWithApiKey(final HttpServletRequest request,  @RequestParam("org-id") final String orgId) {
            return getResponseFromWhoisInternal(request);
    }

    @RequestMapping(value = {"/myresources/v2/allresources", "/myresources/v2/asns", "/myresources/v2/{ipv:ipv4|ipv6}", "/myresources/v2/{ipv:ipv4|ipv6}/{type}"}, method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE})
    public ResponseEntity myResourcesWithApiKey(final HttpServletRequest request,  @RequestParam("org-id") final String orgId) {
        return getResponseFromWhoisInternal(request);
    }

    private ResponseEntity<String> getResponseFromWhoisInternal(final HttpServletRequest request) {
        final String internalPath = StringUtils.substringAfter(request.getRequestURI(), "/api/");
        return whoisInternalService.callPublicPath( internalPath , getHeaders(request), getQueryParams(request));
    }

    private HashMap<String, Object> getQueryParams(final HttpServletRequest request) {
        final Map<String, Object> params = request.getParameterMap().entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue()[0]
            ));

        params.put("clientIp", request.getRemoteAddr());

        return Maps.newHashMap(params);
    }

    private HttpHeaders getHeaders(final HttpServletRequest request) {
        final String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if(StringUtils.isBlank(bearerToken)) {
            throw new IllegalArgumentException("Missing Authorization header");
        }

        final String contentType = request.getHeader(HttpHeaders.ACCEPT);

        final HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add(HttpHeaders.AUTHORIZATION, bearerToken);
        httpHeaders.add(HttpHeaders.ACCEPT, contentType);

        return httpHeaders;
    }
}
