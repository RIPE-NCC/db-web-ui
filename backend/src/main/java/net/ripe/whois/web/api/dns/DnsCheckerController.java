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

        try {
            final InetAddress[] addresses = InetAddress.getAllByName(ns);

            for (InetAddress address : addresses) {

                final Resolver udpResolver = getResolver(address, port, false, 5);
                final Lookup udpLookup = executeQuery(record, udpResolver);
                if (udpLookup.getAnswers() == null || udpLookup.getAnswers().length == 0){
                    return new ResponseEntity(getErrorMessage(ns, address.getHostAddress(), port, udpLookup.getResult(), "UDP"), HttpStatus.OK);
                }

                final Resolver tcpResolver = getResolver(address, port, true, 10);
                final Lookup tcpLookup = executeQuery(record, tcpResolver);
                if (tcpLookup.getAnswers() == null || tcpLookup.getAnswers().length == 0){
                    return new ResponseEntity(getErrorMessage(ns, address.getHostAddress(), port, tcpLookup.getResult(), "TCP"), HttpStatus.OK);
                }

            }
        } catch (Exception e) {
            LOGGER.info("Could not test DNS for "+ns+" "+record );
            LOGGER.info(e.getMessage(), e);
            return new ResponseEntity("{\"code\": -1, \"message\":\"Could not query "+ns+"\"}", HttpStatus.OK);
        }

        return new ResponseEntity("{\"code\": 0, \"message\":\"Name server looks ok\"}", HttpStatus.OK);

    }

    private String getErrorMessage(final String ns, final String address, final int port, final int lookupResult, final String protocol) {
        return "{\"code\": \""+lookupResult+"\", \"message\":\"Could not query "+address+" using "+protocol+" on port "+port+"\"}";
    }

    private Lookup executeQuery(final String record, final Resolver resolver) throws TextParseException {
        final Lookup lookup = new Lookup(record, Type.SOA);
        lookup.setResolver(resolver);
        lookup.run();

        return lookup;
    }

    private Resolver getResolver(final InetAddress address, final int port, final boolean useTCP, final int timeOut) throws UnknownHostException {
        final SimpleResolver resolver = new SimpleResolver(address.getHostAddress());
        resolver.setTCP(useTCP);
        resolver.setPort(port);
        resolver.setTimeout(timeOut);
        return resolver;
    }
}
