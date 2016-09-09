package net.ripe.whois.web.api.dns;

import net.ripe.whois.services.rest.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dns")
public class DnsCheckerController extends RestClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(DnsCheckerController.class);

    private final String dnsCheckerUrl;

    @Autowired
    public DnsCheckerController(@Value("${dns.checker.url}") final String dnsCheckerUrl) {
        this.dnsCheckerUrl = dnsCheckerUrl;
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<String> search(@RequestParam(value = "ns", required = true) final String nameserver) {

        final String request = String.format("{\"method\": \"get_ns_ips\", \"params\": \"%s\"}", nameserver);
        LOGGER.debug("Checking status for " + nameserver);

        return restTemplate.exchange(
            dnsCheckerUrl,
            HttpMethod.POST,
            new HttpEntity<>(request),
            String.class);
    }

}
