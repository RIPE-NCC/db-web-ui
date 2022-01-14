package net.ripe.whois.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

public class WhoisServiceTest {

    public static final String LESS_SPECIFIC_XML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n" +
        "<service name=\"search\"/>\n" +
        "<parameters>\n" +
        "    <inverse-lookup/>\n" +
        "    <type-filters>\n" +
        "        <type-filter id=\"inetnum\"/>\n" +
        "    </type-filters>\n" +
        "    <flags>\n" +
        "        <flag value=\"no-referenced\"/>\n" +
        "        <flag value=\"all-less\"/>\n" +
        "    </flags>\n" +
        "    <query-strings>\n" +
        "        <query-string value=\"194.109.6.0/24\"/>\n" +
        "    </query-strings>\n" +
        "    <sources/>\n" +
        "</parameters>\n" +
        "<objects>\n" +
        "<object type=\"inetnum\">\n" +
        "    <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/inetnum/0.0.0.0 - 255.255.255.255\"/>\n" +
        "    <source id=\"ripe\"/>\n" +
        "    <primary-key>\n" +
        "        <attribute name=\"inetnum\" value=\"0.0.0.0 - 255.255.255.255\"/>\n" +
        "    </primary-key>\n" +
        "    <attributes>\n" +
        "        <attribute name=\"inetnum\" value=\"0.0.0.0 - 255.255.255.255\"/>\n" +
        "        <attribute name=\"netname\" value=\"IANA-BLK\"/>\n" +
        "        <attribute name=\"descr\" value=\"The whole IPv4 address space\"/>\n" +
        "        <attribute name=\"country\" value=\"EU\" comment=\"Country field is actually all countries in the world and not just EU countries\"/>\n" +
        "        <attribute name=\"org\" value=\"ORG-IANA1-RIPE\" referenced-type=\"organisation\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/organisation/ORG-IANA1-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"admin-c\" value=\"IANA1-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/IANA1-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"tech-c\" value=\"IANA1-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/IANA1-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"status\" value=\"ALLOCATED UNSPECIFIED\"/>\n" +
        "        <attribute name=\"remarks\" value=\"This object represents all IPv4 addresses.\"/>\n" +
        "        <attribute name=\"remarks\" value=\"If you see this object as a result of a single IP query, it\"/>\n" +
        "        <attribute name=\"remarks\" value=\"means that the IP address you are querying is not managed by\"/>\n" +
        "        <attribute name=\"remarks\" value=\"the RIPE NCC but by one of the other five RIRs. It might\"/>\n" +
        "        <attribute name=\"remarks\" value=\"also be an address that has been reserved by the IETF as part\"/>\n" +
        "        <attribute name=\"remarks\" value=\"of a protocol or test range.\"/>\n" +
        "        <attribute name=\"remarks\" value=\"You can find the whois server to query, or the\"/>\n" +
        "        <attribute name=\"remarks\" value=\"IANA registry to query on this web page:\"/>\n" +
        "        <attribute name=\"remarks\" value=\"http://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xml\"/>\n" +
        "        <attribute name=\"mnt-by\" value=\"RIPE-NCC-HM-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"mnt-lower\" value=\"RIPE-NCC-HM-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"mnt-routes\" value=\"RIPE-NCC-RPSL-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/RIPE-NCC-RPSL-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"created\" value=\"2002-06-25T14:19:09Z\"/>\n" +
        "        <attribute name=\"last-modified\" value=\"2012-02-08T09:09:31Z\"/>\n" +
        "        <attribute name=\"source\" value=\"RIPE\"/>\n" +
        "    </attributes>\n" +
        "</object>\n" +
        "<object type=\"inetnum\">\n" +
        "    <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/inetnum/193.0.0.0 - 195.255.255.255\"/>\n" +
        "    <source id=\"ripe\"/>\n" +
        "    <primary-key>\n" +
        "        <attribute name=\"inetnum\" value=\"193.0.0.0 - 195.255.255.255\"/>\n" +
        "    </primary-key>\n" +
        "    <attributes>\n" +
        "        <attribute name=\"inetnum\" value=\"193.0.0.0 - 195.255.255.255\"/>\n" +
        "        <attribute name=\"netname\" value=\"EU-ZZ-193\"/>\n" +
        "        <attribute name=\"descr\" value=\"To determine the registration information for a more\"/>\n" +
        "        <attribute name=\"descr\" value=\"specific range, please try a more specific query.\"/>\n" +
        "        <attribute name=\"descr\" value=\"If you see this object as a result of a single IP query,\"/>\n" +
        "        <attribute name=\"descr\" value=\"it means the IP address is currently in the free pool of\"/>\n" +
        "        <attribute name=\"descr\" value=\"address space managed by the RIPE NCC.\"/>\n" +
        "        <attribute name=\"country\" value=\"EU\" comment=\"Country is in fact world wide\"/>\n" +
        "        <attribute name=\"admin-c\" value=\"IANA1-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/IANA1-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"tech-c\" value=\"IANA1-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/IANA1-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"status\" value=\"ALLOCATED UNSPECIFIED\"/>\n" +
        "        <attribute name=\"mnt-by\" value=\"RIPE-NCC-HM-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"created\" value=\"2010-03-11T11:17:15Z\"/>\n" +
        "        <attribute name=\"last-modified\" value=\"2015-09-23T13:18:26Z\"/>\n" +
        "        <attribute name=\"source\" value=\"RIPE\"/>\n" +
        "    </attributes>\n" +
        "</object>\n" +
        "<object type=\"inetnum\">\n" +
        "    <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/inetnum/194.109.0.0 - 194.109.255.255\"/>\n" +
        "    <source id=\"ripe\"/>\n" +
        "    <primary-key>\n" +
        "        <attribute name=\"inetnum\" value=\"194.109.0.0 - 194.109.255.255\"/>\n" +
        "    </primary-key>\n" +
        "    <attributes>\n" +
        "        <attribute name=\"inetnum\" value=\"194.109.0.0 - 194.109.255.255\"/>\n" +
        "        <attribute name=\"org\" value=\"ORG-XIB1-RIPE\" referenced-type=\"organisation\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/organisation/ORG-XIB1-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"netname\" value=\"NL-XS4ALL-960513\"/>\n" +
        "        <attribute name=\"country\" value=\"NL\"/>\n" +
        "        <attribute name=\"admin-c\" value=\"XS42-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/XS42-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"tech-c\" value=\"XS42-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/XS42-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"status\" value=\"ALLOCATED PA\"/>\n" +
        "        <attribute name=\"remarks\" value=\"Please send email to abuse@xs4all.nl for complaints\"/>\n" +
        "        <attribute name=\"remarks\" value=\"regarding portscans, DoS attacks and spam.\"/>\n" +
        "        <attribute name=\"mnt-by\" value=\"RIPE-NCC-HM-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/RIPE-NCC-HM-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"mnt-by\" value=\"XS4ALL-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/XS4ALL-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"mnt-routes\" value=\"XS4ALL-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/XS4ALL-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"created\" value=\"2002-01-09T08:06:01Z\"/>\n" +
        "        <attribute name=\"last-modified\" value=\"2016-11-01T12:20:11Z\"/>\n" +
        "        <attribute name=\"source\" value=\"RIPE\"/>\n" +
        "    </attributes>\n" +
        "    <tags>\n" +
        "        <tag id=\"RIPE-REGISTRY-RESOURCE\"/>\n" +
        "    </tags>\n" +
        "</object>\n" +
        "<object type=\"inetnum\">\n" +
        "    <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/inetnum/194.109.6.0 - 194.109.6.255\"/>\n" +
        "    <source id=\"ripe\"/>\n" +
        "    <primary-key>\n" +
        "        <attribute name=\"inetnum\" value=\"194.109.6.0 - 194.109.6.255\"/>\n" +
        "    </primary-key>\n" +
        "    <attributes>\n" +
        "        <attribute name=\"inetnum\" value=\"194.109.6.0 - 194.109.6.255\"/>\n" +
        "        <attribute name=\"netname\" value=\"XS4ALL\"/>\n" +
        "        <attribute name=\"descr\" value=\"XS4ALL Internet BV\"/>\n" +
        "        <attribute name=\"descr\" value=\"Backbone network\"/>\n" +
        "        <attribute name=\"country\" value=\"NL\"/>\n" +
        "        <attribute name=\"admin-c\" value=\"XS42-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/XS42-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"tech-c\" value=\"XS42-RIPE\" referenced-type=\"role\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/role/XS42-RIPE\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"status\" value=\"ASSIGNED PA\"/>\n" +
        "        <attribute name=\"remarks\" value=\"Please send email to &quot;abuse@xs4all.nl&quot; for complaints\"/>\n" +
        "        <attribute name=\"remarks\" value=\"regarding portscans, DoS attacks and spam.\"/>\n" +
        "        <attribute name=\"mnt-by\" value=\"XS4ALL-MNT\" referenced-type=\"mntner\">\n" +
        "            <link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/ripe/mntner/XS4ALL-MNT\"/>\n" +
        "        </attribute>\n" +
        "        <attribute name=\"created\" value=\"1970-01-01T00:00:00Z\"/>\n" +
        "        <attribute name=\"last-modified\" value=\"2003-12-31T15:46:37Z\"/>\n" +
        "        <attribute name=\"source\" value=\"RIPE\" comment=\"Filtered\"/>\n" +
        "    </attributes>\n" +
        "    <tags>\n" +
        "        <tag id=\"RIPE-USER-RESOURCE\"/>\n" +
        "    </tags>\n" +
        "</object>\n" +
        "</objects>\n" +
        "<terms-and-conditions xlink:type=\"locator\" xlink:href=\"http://www.ripe.net/db/support/db-terms-conditions.pdf\"/>\n" +
        "</whois-resources>";


    private static final String ERROR_XML =
        "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>" +
            "<whois-resources xmlns:xlink=\"http://www.w3.org/1999/xlink\">" +
            "<link xlink:type=\"locator\" xlink:href=\"http://rest.db.ripe.net/search/?query-string=ddd&amp;flags=rL&amp;type-filter=inetnum\"/>" +
            "<errormessages>" +
            "   <errormessage severity=\"Error\" text=\"ERROR:101: no entries found&#xA;&#xA;No entries found in source %s.&#xA;\">" +
            "       <args value=\"RIPE\"/>" +
            "   </errormessage>" +
            "</errormessages>" +
            "<terms-and-conditions xlink:type=\"locator\" xlink:href=\"http://www.ripe.net/db/support/db-terms-conditions.pdf\"/>" +
            "</whois-resources>";

    private static final String MOCK_WHOIS_URL = "http://localhost:8089";

    private final RestTemplate restTemplate = new RestTemplate();
    private final WhoisProxy whoisProxy = new WhoisProxy("/");

    private final WhoisService whoisService = new WhoisService(restTemplate, whoisProxy, MOCK_WHOIS_URL);

    private MockRestServiceServer mockServer;

    @BeforeEach
    public void setUp() {
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    public void shouldFetchParentsForRange() throws Exception {
        mockServer.expect(requestTo(MOCK_WHOIS_URL + "/search.xml?query-string=194.109.6.0/24&type-filter=inetnum&flags=rL"))
            .andRespond(withSuccess(LESS_SPECIFIC_XML, MediaType.APPLICATION_XML));

        final List<String> inetnums = whoisService.getPathToRoot("inetnum", "194.109.6.0/24", "ORG-XIB1-RIPE");
        mockServer.verify();

        assertEquals(1, inetnums.size());
        assertEquals("194.109.0.0 - 194.109.255.255", inetnums.get(0));
    }

    @Test
    public void shouldReturnEmptyList() throws Exception {
        mockServer.expect(requestTo(MOCK_WHOIS_URL + "/search.xml?query-string=blabla&type-filter=inetnum&flags=rL"))
            .andRespond(withSuccess(ERROR_XML, MediaType.APPLICATION_XML));

        final List<String> inetnums = whoisService.getPathToRoot("inetnum", "blabla", "ORG-XIB1-RIPE");
        mockServer.verify();

        assertEquals(0, inetnums.size());
    }

}
