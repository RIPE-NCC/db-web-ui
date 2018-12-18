package net.ripe.whois.web.api.dns;

import com.github.jgonian.ipmath.Ipv4;
import com.github.jgonian.ipmath.Ipv6;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.whois.domain.UserInfoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.Optional;
import java.util.regex.Pattern;

import static net.ripe.whois.CrowdTokenFilter.CROWD_TOKEN_KEY;

@RestController
@RequestMapping("/api/dns")
@SuppressWarnings("UnusedDeclaration")
public class DnsCheckerController {
    private final static Logger LOGGER = LoggerFactory.getLogger(DnsCheckerController.class);

    private final WhoisInternalService whoisInternalService;
    private final DnsClient dnsClient;

    private static final Pattern INVALID_INPUT = Pattern.compile("[^a-zA-Z0-9\\\\.:-]");

    @Autowired
    public DnsCheckerController(final WhoisInternalService whoisInternalService, final DnsClient dnsClient) {
        this.whoisInternalService = whoisInternalService;
        this.dnsClient = dnsClient;
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<Response> status(@CookieValue(value = CROWD_TOKEN_KEY) final String crowdToken,
                                         @RequestParam(value = "ns") final String inNs,
                                         @RequestParam(value = "record") final String inRecord) {

        UserInfoResponse userInfoResponse = whoisInternalService.getUserInfo(crowdToken);
        LOGGER.info("DNS check for user {}", userInfoResponse.user.username);
        // tidy up a bit
        final String ns = inNs.trim();
        final String record = inRecord.trim();

        if (isInputInvalid(ns) || isInputInvalid(inRecord)) {
            return new ResponseEntity<>(new Response(ns, -1, "Invalid characters in input"), HttpStatus.OK);
        }

        if (!isNameserverValid(ns)) {
            return new ResponseEntity<>(new Response(ns, -1, "Could not resolve " + ns), HttpStatus.OK);
        }

        final Optional<String> errorMessage = dnsClient.checkDnsConfig(ns, record);
        if (errorMessage.isPresent()) {
            return new ResponseEntity<>(new Response(ns, -1, errorMessage.get()) , HttpStatus.OK);
        }

        LOGGER.info("Success DNS check for {}", ns);
        return new ResponseEntity<>(new Response(ns, 0, "Server is authoritative for " + record), HttpStatus.OK);
    }

    private boolean isInputInvalid(final String inString) {
        return INVALID_INPUT.matcher(inString).find();
    }

    private boolean isNameserverValid(final String ns) {
        try {
            final String[] split = ns.split("\\.");
            final String tld = split[split.length - 1];

            Integer.parseInt(tld);
            return false;
        } catch (NumberFormatException e) {
            //It should not be a valid integer
        }

        try {
            Ipv4.parse(ns);
            return false;
        } catch (IllegalArgumentException e) {
            //It should not be a valid ipv4
        }

        try {
            Ipv6.parse(ns);
            return false;
        } catch (IllegalArgumentException e) {
            //It should not be a valid ipv6
        }

        return true;
    }

    @XmlRootElement
    public static class Response {

        private final String ns;
        private final int code;
        private final String message;

        public Response(final String ns, final int code, final String message) {
            this.ns = ns;
            this.code = code;
            this.message = message;
        }

        public String getNs() {
            return this.ns;
        }

        public int getCode() {
            return this.code;
        }

        public String getMessage() {
            return this.message;
        }
    }


}

