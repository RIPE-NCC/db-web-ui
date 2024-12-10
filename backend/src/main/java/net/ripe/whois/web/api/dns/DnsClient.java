package net.ripe.whois.web.api.dns;

import org.apache.commons.lang3.ArrayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.xbill.DNS.Lookup;
import org.xbill.DNS.Resolver;
import org.xbill.DNS.SimpleResolver;
import org.xbill.DNS.TextParseException;
import org.xbill.DNS.Type;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class DnsClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(DnsClient.class);

    private static final String LEARN_MORE_MESSAGE = "<a href=\"https://docs.db.ripe.net/Database-Support/Configuring-Reverse-DNS/\" target=\"_blank\">Learn More</a>";

    private final int port;

    @Autowired
    public DnsClient(@Value("${dns.check.port:53}") final int port) {
        this.port = port;
    }

    public Optional<String> checkDnsConfig(final String ns, final String record) {
        final List<InetAddress> addresses = getAddresses(ns);
        if (addresses.isEmpty()) {
            return Optional.of(String.format("Could not resolve %s", ns));
        }

        for (InetAddress address : addresses) {
            for (DnsClient.TransportProtocol protocol : DnsClient.TransportProtocol.values()) {
                final Optional<String> errorMessage = checkDnsConfig(ns, record, address, protocol);
                if (errorMessage.isPresent()) {
                    return errorMessage;
                }
            }
        }

        return Optional.empty();
    }

    private Optional<String> checkDnsConfig(final String ns, final String record, final InetAddress address, final TransportProtocol protocol) {
        try {
            LOGGER.info("Querying for {}@{} ({}) using {}", record, ns, address, protocol);
            final Resolver resolver = getResolver(address, port, protocol);
            final Lookup lookup = executeQuery(record, resolver);
            LOGGER.info("Response message for {} ({}):{}", ns, address, lookup.getErrorString());
            if ("timed out".equalsIgnoreCase(lookup.getErrorString()) ||
                    "network error".equalsIgnoreCase(lookup.getErrorString())) {
                return Optional.of(String.format("No reply from %s on port %d/%s. %s", address.getHostAddress(), port, protocol, LEARN_MORE_MESSAGE));
            }

            if (ArrayUtils.isEmpty(lookup.getAnswers())) {
                return Optional.of(String.format("Server is not authoritative for %s. %s", record, LEARN_MORE_MESSAGE));
            }

            return Optional.empty();

        } catch (Exception e) {
            LOGGER.info("Could not test DNS for {} due to {}: {}", ns, e.getClass().getName(), e.getMessage());
            return Optional.of(String.format("Could not check %s. %s", ns, LEARN_MORE_MESSAGE));
        }
    }

    private List<InetAddress> getAddresses(final String ns) {
        try {
            return Arrays.asList(InetAddress.getAllByName(ns));
        } catch (UnknownHostException e) {
            LOGGER.info("Could not resolve '{}' {} {}", ns, e.getClass().getName(), e.getMessage());
            return Collections.emptyList();
        }
    }

    private Lookup executeQuery(final String record, final Resolver resolver) throws TextParseException {
        final Lookup lookup = new Lookup(record, Type.SOA);
        lookup.setCache(null);
        lookup.setResolver(resolver);
        lookup.run();
        return lookup;
    }

    private Resolver getResolver(final InetAddress address, final int port, final TransportProtocol protocol) throws UnknownHostException {
        final SimpleResolver resolver = new SimpleResolver();
        resolver.setAddress(address);
        resolver.setTCP(TransportProtocol.TCP == protocol);
        resolver.setPort(port);
        resolver.setTimeout(protocol.timeout);
        return resolver;
    }

    public enum TransportProtocol {
        TCP(10), UDP(5);

        private final int timeout;

        TransportProtocol(final int timeout) {
            this.timeout = timeout;
        }
    }


}
