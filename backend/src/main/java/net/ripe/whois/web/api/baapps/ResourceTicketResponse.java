package net.ripe.whois.web.api.baapps;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.*;


@JsonIgnoreProperties(ignoreUnknown = true)
class ResourceTicketResponse {

    ResourceTicketResponse() {
        this.tickets = new HashMap<>();
    }

    void addTickets(final String resource, final List<ResourceTicket> resourceTickets) {
        if (!tickets.containsKey(resource)) {
            tickets.put(resource, new ArrayList<>());
        }
        tickets.get(resource).addAll(resourceTickets);
    }

    static final class ResourceTicket {

        ResourceTicket(final String number, final String date, final String ticketResource) {
            this.number = number;
            this.date = date;
            this.ticketResource = ticketResource;
        }

        String getTicketResource() {
            return ticketResource;
        }

        @JsonProperty("number")
        final private String number;

        @JsonProperty("date")
        final private String date;

        @JsonProperty("resource")
        final private String ticketResource;
    }

    @JsonProperty("tickets")
    private final Map<String, List<ResourceTicket>> tickets;
}
