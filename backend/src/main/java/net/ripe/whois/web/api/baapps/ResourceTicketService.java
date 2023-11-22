package net.ripe.whois.web.api.baapps;

import com.google.common.collect.Iterables;
import net.ripe.db.whois.common.ip.Ipv4Resource;
import net.ripe.db.whois.common.ip.Ipv6Resource;
import net.ripe.db.whois.common.rpsl.attrs.AttributeParseException;
import net.ripe.db.whois.common.rpsl.attrs.AutNum;
import net.ripe.whois.config.CacheConfiguration;
import net.ripe.whois.services.RsngService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.StreamSupport;

import static net.ripe.whois.web.api.baapps.ResourceTicketMap.KeyType;

@Service
public class ResourceTicketService {

    private final RsngService rsngService;

    @Autowired
    ResourceTicketService(final RsngService rsngService) {
        this.rsngService = rsngService;
    }

    /**
     * Get all resource tickets for a member.
     * @param memberId
     * @return
     */
    @Cacheable(CacheConfiguration.RESOURCE_TICKET_MEMBER_CACHE)
    public ResourceTicketResponse getTicketsForMember(final long memberId) {
        final ResourceTicketResponse resourceTickets = new ResourceTicketResponse();

        resourceTicketMap(rsngService.getMemberResources(memberId))
            .getTickets()
            .forEach(resourceTicket -> resourceTickets.addTickets(resourceTicket.getResource(), Collections.singletonList(resourceTicket)));

        return resourceTickets;
    }

    /**
     * Get all tickets for a specified resource and member.
     * @param memberId
     * @param resource
     * @return
     */
    @Cacheable(CacheConfiguration.RESOURCE_TICKET_MEMBER_AND_RESOURCE_CACHE)
    public ResourceTicketResponse getTicketsForMember(final long memberId, final String resource) {
        final MemberResources memberResources = rsngService.getMemberResources(memberId);
        return filteredResponse(resource, resourceTicketMap(memberResources));
    }

    // TODO: [ES] refactor this code

    private ResourceTicketMap resourceTicketMap(final MemberResources memberResources) {
        final ResourceTicketMap resourceTicketMap = new ResourceTicketMap();
        resourceTicketMap.addTickets(KeyType.ASN, resourceTickets(memberResources.getContent().getAsns()));
        resourceTicketMap.addTickets(KeyType.IPV4, resourceTickets(Iterables.concat(memberResources.getContent().getIpv4Allocations(), memberResources.getContent().getIpv4Assignments(), memberResources.getContent().getIpv4ErxResources())));
        resourceTicketMap.addTickets(KeyType.IPV6, resourceTickets(Iterables.concat(memberResources.getContent().getIpv6Allocations(), memberResources.getContent().getIpv6Assignments())));
        return resourceTicketMap;
    }

    private List<ResourceTicketResponse.ResourceTicket> resourceTickets(final Iterable<MemberResources.Resource> resources) {
        return StreamSupport.stream(resources.spliterator(), false)
            .map(resource -> new ResourceTicketResponse.ResourceTicket(resource.getTicketNumber(), resource.getRegistrationDate(), resource.getResource()))
            .toList();
    }

    private ResourceTicketResponse filteredResponse(final String resource, final ResourceTicketMap ticketMap) {
        final ResourceTicketResponse rtr = new ResourceTicketResponse();
        final KeyType type = determineType(resource);
        final List<ResourceTicketResponse.ResourceTicket> allTickets = ticketMap.getTickets(type);
        rtr.addTickets(resource,
                allTickets.stream()
                        .filter(resourceTicket -> ticketFilter(type, resource, resourceTicket))
                        .toList());
        return rtr;
    }

    private KeyType determineType(final String resource) {
        if (isValidAutnum(resource)) {
            return KeyType.ASN;
        } else {
            if (isValidInetnum(resource)) {
                return KeyType.IPV4;
            } else {
                if (isValidInet6num(resource)) {
                    return KeyType.IPV6;
                }
                else {
                    throw new IllegalArgumentException("Invalid Type " + resource);
                }
            }
        }
    }

    private static boolean isValidAutnum(final String key) {
        try {
            AutNum.parse(key);
            return true;
        } catch (AttributeParseException e) {
            return false;
        }
    }

    private static boolean isValidInetnum(final String key) {
        if (key.indexOf(':') != - 1) {
            return false;
        }
        try {
            Ipv4Resource.parse(key);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static boolean isValidInet6num(final String key) {
        if (key.indexOf(':') == - 1) {
            return false;
        }
        try {
            Ipv6Resource.parse(key);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private boolean ticketFilter(final KeyType type, final String resource, final ResourceTicketResponse.ResourceTicket resourceTicket) {
        switch (type) {
            case IPV4:
                final Ipv4Resource v4res = Ipv4Resource.parse(resource);
                return v4res.intersects(Ipv4Resource.parse(resourceTicket.getResource()));
            case IPV6:
                final Ipv6Resource v6res = Ipv6Resource.parse(resource);
                return v6res.intersects(Ipv6Resource.parse(resourceTicket.getResource()));
            case ASN:
                return resourceTicket.getResource().toUpperCase().startsWith(resource.toUpperCase());
            default:
                return false;
        }
    }
}
