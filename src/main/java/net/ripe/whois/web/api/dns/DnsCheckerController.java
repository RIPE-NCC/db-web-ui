package net.ripe.whois.web.api.dns;

import net.ripe.whois.services.crowd.CrowdClient;
import net.ripe.whois.services.rest.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import javax.ws.rs.ClientErrorException;

@RestController
@RequestMapping("/api/dns")
public class DnsCheckerController extends RestClient {

    @Autowired
    public DnsCheckerController(@Value("${dns.checker.url}") final String dnsCheckerUrl, final CrowdClient crowdClient) {
        this.dnsCheckerUrl = dnsCheckerUrl;
        this.crowdClient = crowdClient;
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<String> status(
            @CookieValue(value = "crowd.token_key") final String crowdToken,
            @RequestParam(value = "ns") final String nameserver) {

        if (crowdToken == null || !crowdClient.getUserSession(crowdToken).isActive()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        final String request = String.format("{\"method\": \"get_ns_ips\", \"params\": \"%s\"}", nameserver);
        LOGGER.debug("Checking status for " + nameserver);
        try {
            final ResponseEntity<String> response = restTemplate.exchange(
                    dnsCheckerUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(request),
                    String.class);

            if (response.getBody().contains("0.0.0.0")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (ClientErrorException e) {
            return new ResponseEntity<>(HttpStatus.valueOf(e.getResponse().getStatus()));
        } catch (HttpClientErrorException e) {
            return new ResponseEntity<>(e.getStatusCode());
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private final CrowdClient crowdClient;
    private final String dnsCheckerUrl;
    private final static Logger LOGGER = LoggerFactory.getLogger(DnsCheckerController.class);
}
