package net.ripe.whois.web.api.baapps;

import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.whois.services.BaAppsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/ba-apps")
public class BaAppsController {

    private final BaAppsService baAppsService;

    @Autowired
    public BaAppsController(final BaAppsService baAppsService) {
        this.baAppsService = baAppsService;
    }

    @RequestMapping(value = "/lirs", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getLirs(@CookieValue(value = "crowd.token_key") final String crowdToken) {
        try {
            final String json = baAppsService.getLirs(crowdToken);

            // Make sure essentials content-type is set
            final MultiValueMap<String, String> headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

            return new ResponseEntity<>(json, headers, HttpStatus.OK);
        } catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping(value = "/organisations", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity getOrganisations(@CookieValue(value = "crowd.token_key") final String crowdToken) {
        try {
            final String json = baAppsService.getOrganisations(crowdToken);

            // Make sure essentials content-type is set
            final MultiValueMap<String, String> headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

            return new ResponseEntity<>(json, headers, HttpStatus.OK);
        } catch (RestClientException e) {
            // No error message in response
            return new ResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

