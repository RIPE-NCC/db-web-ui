package net.ripe.whois.web.api.baapps;

import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.List;
import java.util.Map;

/**
 * Map of tickets by resource type
 */
@XmlRootElement
class ResourceTicketMap {

    private final Map<KeyType, List<ResourceTicketResponse.ResourceTicket>> map = Maps.newHashMap();

    public ResourceTicketMap() {
        for (KeyType type : KeyType.values()) {
            map.put(type, Lists.newArrayList());
        }
    }

    void addTickets(final KeyType type, final List<ResourceTicketResponse.ResourceTicket> tickets) {
        map.get(type).addAll(tickets);
    }

    void addTickets(final KeyType type, final Iterable<ResourceTicketResponse.ResourceTicket> tickets) {
        Iterables.addAll(map.get(type), tickets);
    }

    public List<ResourceTicketResponse.ResourceTicket> getTickets(final KeyType type) {
        return map.get(type);
    }

    public List<ResourceTicketResponse.ResourceTicket> getTickets() {
        return map.values().stream().flatMap(List::stream).toList();
    }

    public enum KeyType {
        IPV4, IPV6, ASN
    }
}
