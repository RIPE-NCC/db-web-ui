package net.ripe.whois.web.api.baapps;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.List;
import java.util.Map;

/**
 * Resource tickets for a specific member
 *
 */
@XmlRootElement
@JsonIgnoreProperties(ignoreUnknown = true)
class ResourceTicketResponse {

    @JsonProperty("tickets")
    private final Map<String, List<ResourceTicket>> tickets;

    public ResourceTicketResponse() {
        this.tickets = Maps.newHashMap();
    }

    public void addTickets(final String resource, final List<ResourceTicket> resourceTickets) {
        if (!tickets.containsKey(resource)) {
            tickets.put(resource, Lists.newArrayList());
        }
        tickets.get(resource).addAll(resourceTickets);
    }

    public static class ResourceTicket {

        @JsonProperty("number")
        final private String number;

        @JsonProperty("date")
        final private String date;

        @JsonProperty("resource")
        final private String resource;

        ResourceTicket(final String number, final String date, final String resource) {
            this.number = number;
            this.date = date;
            this.resource = resource;
        }

        String getResource() {
            return resource;
        }
    }
}
