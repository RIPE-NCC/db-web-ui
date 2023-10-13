package net.ripe.whois.web.api.baapps;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.List;

/**
 * Member Resources from RSNG for a specified member id.
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MemberResources {

    private Response response;

    public Response getResponse() {
        return response;
    }

    public Content getContent() {
        return response.content;
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Response {
        private int status;
        private String message;
        private int totalSize;
        private Content content;

        public int getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }

        public int getTotalSize() {
            return totalSize;
        }

        public Content getContent() {
            return content;
        }
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Content {

        private int membershipId;
        private List<Resource> asns;
        private List<Resource> ipv4Allocations;
        private List<Resource> ipv4Assignments;
        private List<Resource> ipv4ErxResources;
        private List<Resource> ipv6Allocations;
        private List<Resource> ipv6Assignments;

        public int getMembershipId() {
            return membershipId;
        }

        public List<Resource> getAsns() {
            return asns;
        }

        public List<Resource> getIpv4Allocations() {
            return ipv4Allocations;
        }

        public List<Resource> getIpv4Assignments() {
            return ipv4Assignments;
        }

        public List<Resource> getIpv4ErxResources() {
            return ipv4ErxResources;
        }

        public List<Resource> getIpv6Allocations() {
            return ipv6Allocations;
        }

        public List<Resource> getIpv6Assignments() {
            return ipv6Assignments;
        }
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Resource {

        private String resource;
        private String ticketNumber;
        private String registrationDate;

        public String getResource() {
            return resource;
        }

        public String getTicketNumber() {
            return ticketNumber;
        }

        public String getRegistrationDate() {
            return registrationDate;
        }
    }

}
