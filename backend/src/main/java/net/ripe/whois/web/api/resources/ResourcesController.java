package net.ripe.whois.web.api.resources;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.WhoisInternalResourcesService;
import net.ripe.whois.services.crowd.CrowdClient;
import net.ripe.whois.services.crowd.CrowdClientException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@SuppressWarnings("UnusedDeclaration")
public class ResourcesController {

    private final WhoisInternalResourcesService whoisInternalResourcesService;

    @Autowired
    public ResourcesController(final WhoisInternalResourcesService whoisInternalResourcesService) {
        this.whoisInternalResourcesService = whoisInternalResourcesService;
    }

    @RequestMapping(value = "/ipv4")
    public ResponseEntity getIpv4Resources(@RequestParam(value = "orgid") final String orgId) {

        try {
            final ResponseEntity response = whoisInternalResourcesService.getIpv4Resources(orgId);

            // Make sure essentials content-type is set
            final MultiValueMap<String, String> headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

            return new ResponseEntity<>(response, headers, HttpStatus.OK);

        } catch (CrowdClientException e) {
            return new ResponseEntity(HttpStatus.UNAUTHORIZED);
        }  catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
