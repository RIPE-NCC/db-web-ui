package net.ripe.whois.web.api.dns;

import com.github.jgonian.ipmath.Ipv4;
import com.github.jgonian.ipmath.Ipv6;
import net.ripe.whois.services.crowd.CrowdClient;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.xbill.DNS.*;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/dns")
public class DnsCheckerController {
    private final static Logger LOGGER = LoggerFactory.getLogger(DnsCheckerController.class);

    private final CrowdClient crowdClient;
    private final int port;

    private static final String LEARN_MORE_MSG = "<a href=\\\"https://www.ripe.net/manage-ips-and-asns/db/support/configuring-reverse-dns#4--reverse-dns-troubleshooting\\\" target=\\\"_blank\\\">Learn More</a>";
    private static final String LEARN_MORE_MESSAGE = "<a href=\"https://www.ripe.net/manage-ips-and-asns/db/support/configuring-reverse-dns#4--reverse-dns-troubleshooting\" target=\"_blank\">Learn More</a>";
    private static final Pattern INVALID_INPUT = Pattern.compile("[^a-zA-Z0-9\\\\.:-]");

    @Autowired
    public DnsCheckerController(final CrowdClient crowdClient, @Value("${dns.check.port:53}") final int port) {
        this.crowdClient = crowdClient;
        this.port = port;
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<String> status(@CookieValue(value = "crowd.token_key") final String crowdToken,
                                         @RequestParam(value = "ns") final String inNs,
                                         @RequestParam(value = "record") final String inRecord) {


        if (crowdToken == null || !crowdClient.getUserSession(crowdToken).isActive()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        // tidy up a bit
        String ns = inNs.trim();
        String record = inRecord.trim();

        if (sanityCheckFailed(ns) || sanityCheckFailed(inRecord)) {
            return new ResponseEntity<>(jsonResponse(-1, "Invalid characters in input"), HttpStatus.OK);
        }

        if (!nameserverChecksOut(ns)) {
            return new ResponseEntity<>(jsonResponse(-1, "Could not resolve " + ns), HttpStatus.OK);
        }

        final List<InetAddress> addresses = getAddresses(ns);
        if (addresses.isEmpty()) {
            return new ResponseEntity<>(jsonResponse(-1, "Could not resolve " + ns), HttpStatus.OK);
        }

        for (InetAddress address : addresses) {
            for (TransportProtocol protocol : TransportProtocol.values()) {
                final Optional<String> errorMessage = checkDnsConfig(ns, record, address, protocol);
                if (errorMessage.isPresent()) {
                    return new ResponseEntity<>(errorMessage.get(), HttpStatus.OK);
                }
            }
        }

        LOGGER.info("Success DNS check for " + ns);
        return new ResponseEntity<>(jsonResponse(0, "Server is authoritative for " + record), HttpStatus.OK);
    }

    private boolean sanityCheckFailed(final String inString) {
        Matcher matcher = INVALID_INPUT.matcher(inString);
        return matcher.find();
    }

    private boolean nameserverChecksOut(final String ns) {
        try {
            final String[] split = ns.split("\\.");
            String tld = split[split.length - 1];

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

    private Optional<String> checkDnsConfig(final String ns, final String record, final InetAddress address, final TransportProtocol protocol) {
        try {
            LOGGER.info("Querying " + ns + " (" + address + ") using " + protocol);
            final Resolver resolver = getResolver(address, port, protocol);
            final Lookup lookup = executeQuery(record, resolver);
            LOGGER.info("Response message for " + ns + " (" + address + "):" + lookup.getErrorString());
            if ("timed out".equalsIgnoreCase(lookup.getErrorString()) || "network error".equalsIgnoreCase(lookup.getErrorString())) {
                String msgString = "No reply from " + address.getHostAddress() + " on port " + port + "/" + protocol + ". " + LEARN_MORE_MESSAGE;
                return Optional.of(jsonResponse(-1, msgString));
            }

            if (lookup.getAnswers() == null || lookup.getAnswers().length == 0) {
                String msgString = "Server is not authoritative for " + record + ". " + LEARN_MORE_MESSAGE;
                return Optional.of(jsonResponse(-1, msgString));
            }

            return Optional.empty();

        } catch (Exception e) {
            LOGGER.info("Could not test DNS for " + ns);
            LOGGER.info(e.getMessage(), e);
            String msgString = "Could not check " + ns + ". " + LEARN_MORE_MESSAGE;
            return Optional.of(jsonResponse(-1, msgString));
        }
    }

    private Lookup executeQuery(final String record, final Resolver resolver) throws TextParseException {
        final Lookup lookup = new Lookup(record, Type.SOA);
        lookup.setCache(null);
        lookup.setResolver(resolver);
        lookup.run();
        return lookup;
    }

    private Resolver getResolver(final InetAddress address, final int port, final TransportProtocol transportProtocol) throws UnknownHostException {
        final SimpleResolver resolver = new SimpleResolver();
        resolver.setAddress(address);
        resolver.setTCP(transportProtocol == TransportProtocol.TCP);
        resolver.setPort(port);
        resolver.setTimeout(transportProtocol.timeout);
        return resolver;
    }

    private List<InetAddress> getAddresses(final String ns) {
        try {
            return Arrays.asList(InetAddress.getAllByName(ns));
        } catch (UnknownHostException e) {
            LOGGER.info("Could not resolve '" + ns + "' " + e.getClass().getName() + " " + e.getMessage());
            return Arrays.asList();
        }
    }

    private static String jsonResponse(final int code, final String message) {
        JSONObject json = new JSONObject();
        try {
            json.put("code", code);
            json.put("message", message);
            return json.toString();
        } catch (JSONException e) {
            return "{}";
        }
    }
}

enum TransportProtocol {
    TCP(10), UDP(5);

    final int timeout;

    TransportProtocol(final int timeout) {
        this.timeout = timeout;
    }
}
