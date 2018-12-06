package net.ripe.whois.web.api.baapps;

import net.ripe.db.whois.common.ip.Ipv4Resource;
import net.ripe.db.whois.common.ip.Ipv6Resource;
import net.ripe.db.whois.common.rpsl.attrs.AttributeParseException;
import net.ripe.db.whois.common.rpsl.attrs.AutNum;
import net.ripe.whois.services.BaAppsService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static net.ripe.whois.web.api.baapps.ResourceTicketMap.KeyType;


@Service
public class ResourceTicketService {

    private final BaAppsService baAppsService;

    @Autowired
    ResourceTicketService(final BaAppsService baAppsService) {
        this.baAppsService = baAppsService;
    }

    @Cacheable("net.ripe.whois.web.api.baapps.ResourceTicketService")
    public ResourceTicketMap getTicketsForMember(final long memberId) throws JSONException {
        final String jsonTickets = baAppsService.getResourceTickets(memberId);
        final JSONObject content = new JSONObject(jsonTickets).getJSONObject("response").getJSONObject("content");
        final ResourceTicketMap map = new ResourceTicketMap();

        JSONArray resourceArray;
        resourceArray = content.getJSONArray("ipv4Allocations");
        map.addTickets(KeyType.IPV4, jsonToList(resourceArray));
        resourceArray = content.getJSONArray("ipv4Assignments");
        map.addTickets(KeyType.IPV4, jsonToList(resourceArray));
        resourceArray = content.getJSONArray("ipv4ErxResources");
        map.addTickets(KeyType.IPV4, jsonToList(resourceArray));
        resourceArray = content.getJSONArray("ipv6Allocations");
        map.addTickets(KeyType.IPV6, jsonToList(resourceArray));
        resourceArray = content.getJSONArray("ipv6Assignments");
        map.addTickets(KeyType.IPV6, jsonToList(resourceArray));
        resourceArray = content.getJSONArray("asns");
        map.addTickets(KeyType.ASN, jsonToList(resourceArray));
        return map;
    }

    ResourceTicketResponse filteredResponse(final String resource, final ResourceTicketMap ticketMap) throws JSONException {
        final ResourceTicketResponse rtr = new ResourceTicketResponse();
        final KeyType type = determineType(resource);
        final List<ResourceTicketResponse.ResourceTicket> allTickets = ticketMap.getTickets(type);
        rtr.addTickets(resource,
                allTickets.stream()
                        .filter(resourceTicket -> ticketFilter(type, resource, resourceTicket))
                        .collect(Collectors.toList()));
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
                return v4res.intersects(Ipv4Resource.parse(resourceTicket.getTicketResource()));
            case IPV6:
                final Ipv6Resource v6res = Ipv6Resource.parse(resource);
                return v6res.intersects(Ipv6Resource.parse(resourceTicket.getTicketResource()));
            case ASN:
                return resourceTicket.getTicketResource().toUpperCase().startsWith(resource.toUpperCase());
            default:
                return false;
        }
    }

    private ArrayList<ResourceTicketResponse.ResourceTicket> jsonToList(final JSONArray resourceArray) throws JSONException {
        final ArrayList<ResourceTicketResponse.ResourceTicket> tickets = new ArrayList<>();
        for (int i = 0; i < resourceArray.length(); i++) {
            final JSONObject asn = resourceArray.getJSONObject(i);
            final ResourceTicketResponse.ResourceTicket rt =
                    new ResourceTicketResponse.ResourceTicket(
                            asn.getString("ticketNumber"),
                            asn.getString("registrationDate"),
                            asn.getString("resource"));
            tickets.add(rt);
        }
        return tickets;
    }
}
