package net.ripe.whois.web.api.baapps;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.List;
import java.util.Map;


class ResourceTicketMap {

    private final Map<KeyType, List<ResourceTicketResponse.ResourceTicket>> map = Maps.newHashMap();

    ResourceTicketMap() {
        for (KeyType type : KeyType.values()) {
            map.put(type, Lists.newArrayList());
        }
    }

    void addTickets(KeyType type, List<ResourceTicketResponse.ResourceTicket> tickets) {
        map.get(type).addAll(tickets);
    }

    List<ResourceTicketResponse.ResourceTicket> getTickets(KeyType type) {
        return map.get(type);
    }

    enum KeyType {
        IPV4, IPV6, ASN
    }
}
