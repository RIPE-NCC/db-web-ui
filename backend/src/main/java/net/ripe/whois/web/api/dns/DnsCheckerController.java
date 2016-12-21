package net.ripe.whois.web.api.dns;

import net.ripe.whois.services.crowd.CrowdClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.xbill.DNS.Lookup;
import org.xbill.DNS.Resolver;
import org.xbill.DNS.SimpleResolver;
import org.xbill.DNS.TextParseException;
import org.xbill.DNS.Type;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dns")
public class DnsCheckerController {
    private final static Logger LOGGER = LoggerFactory.getLogger(DnsCheckerController.class);

    private final CrowdClient crowdClient;
    private final int port;

    @Autowired
    public DnsCheckerController(final CrowdClient crowdClient, @Value("${dns.check.port:53}") final int port) {
        this.crowdClient = crowdClient;
        this.port = port;
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    public ResponseEntity<String> status(@CookieValue(value = "crowd.token_key") final String crowdToken,
                                         @RequestParam(value = "ns") final String ns,
                                         @RequestParam(value = "record") final String record) {

        if (crowdToken == null || !crowdClient.getUserSession(crowdToken).isActive()) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        final List<InetAddress> addresses = getAddresses(ns);
        if(addresses.isEmpty()) {
            return new ResponseEntity<>("{\"code\": -1, \"message\":\"Could not resolve " + ns + "\"}", HttpStatus.OK);
        }

        for (InetAddress address : addresses) {
            for(TransportProtocol protocol : TransportProtocol.values()) {
                final Optional<String> errorMessage = checkDnsConfig(ns, record, address, protocol);
                if(errorMessage.isPresent()) {
                    return new ResponseEntity<>(errorMessage.get(), HttpStatus.OK);
                }
            }
        }

        LOGGER.info("Success DNS check for " + ns);
        return new ResponseEntity<>("{\"code\": 0, \"message\":\"Server responds on port 53\"}", HttpStatus.OK);
    }

    private Optional<String> checkDnsConfig(final String ns, final String record, final InetAddress address, final TransportProtocol protocol) {
        try {
            LOGGER.info("Querying " + ns + " (" + address + ") using " + protocol);
            final Resolver resolver = getResolver(address, port, protocol);
            final Lookup lookup = executeQuery(record, resolver);
            LOGGER.info("Response message for " + ns + " (" + address + "):" + lookup.getErrorString());
            if ("timed out".equalsIgnoreCase(lookup.getErrorString()) || "network error".equalsIgnoreCase(lookup.getErrorString())) {
                return Optional.of("{\"code\": " + lookup.getResult() + ", \"message\":\"Could not query " + address.getHostAddress() + " using " + protocol + " on port " + port + "\"}");
            }

            if (lookup.getAnswers() == null || lookup.getAnswers().length == 0) {
                String msgString = "SOA record " + record + " not found. <a href=\\\"https://www.ripe.net/manage-ips-and-asns/db/support/configuring-reverse-dns#4--reverse-dns-troubleshooting\\\" target=\\\"_blank\\\">Learn More</a>";
                return Optional.of("{\"code\": " + lookup.getResult() + ", \"message\":\"" + msgString + "\"}");
            }

            return Optional.empty();

        } catch (Exception e) {
            LOGGER.info("Could not test DNS for " + ns);
            LOGGER.info(e.getMessage(), e);
            return Optional.of("{\"code\": -1, \"message\":\"Could not check " + ns + "\"}");
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
            LOGGER.info("Could not resolve '" + ns + "' message was: " + e.getClass().getName());
            return Arrays.asList();
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
