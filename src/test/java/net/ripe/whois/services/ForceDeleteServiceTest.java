package net.ripe.whois.services;

import com.google.common.collect.Lists;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.client.RestClientTarget;
import net.ripe.db.whois.common.rpsl.ObjectType;
import net.ripe.db.whois.common.rpsl.RpslObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class ForceDeleteServiceTest {
    private static final Logger LOGGER = LoggerFactory.getLogger(ForceDeleteServiceTest.class);

    @Test
    public void shouldDetectInvalidObjectType() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("xyz", "193.0.0.1-193.0.0.1", null, null, null, Collections.<RpslObject>emptyList())
        );

        try {
            subject.getMntnersToForceDelete("RIPE", "xyz", "193.0.0.1");
            fail();
        } catch (RestClientException exc) {
            assertThat(400, is(exc.getStatus()));
        }
    }

    @Test
    public void shouldDetectInvalidObjectName() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("inetnum", "abc", null, null, null, Collections.<RpslObject>emptyList())
        );

        try {
            subject.getMntnersToForceDelete("RIPE", "inetnum", "abc");
            fail();
        } catch (RestClientException exc) {
            assertThat(400, is(exc.getStatus()));
        }
    }

    @Test
    public void shouldFindMntnersForNonExistingInetnum() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("inetnum", "193.0.0.1-193.0.0.1", null,
                Lists.newArrayList("inetnum"), "193.0.0.1-193.0.0.1", Collections.<RpslObject>emptyList())
        );

        List<Map<String, Object>> mntners = subject.getMntnersToForceDelete("RIPE", "inetnum", "193.0.0.1-193.0.0.1");

        assertThat(mntners, hasSize(0));
    }


    @Test
    public void shouldFindMntnersForNonExactMatchingInetnum() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("inetnum", "193.0.0.1-193.0.0.1", null,
                Lists.newArrayList("inetnum"), "193.0.0.1-193.0.0.1", Lists.newArrayList(
                    RpslObject.parse("inetnum: 190.0.0.0 - 195.255.255.255\nmnt-by: TEST2-MNT\n"),
                    RpslObject.parse("inetnum: 193.0.0.0 - 193.255.255.255\nmnt-by: TEST1-MNT\n")
                ))
        );

        List<Map<String, Object>> mntners = subject.getMntnersToForceDelete("RIPE", "inetnum", "193.0.0.1-193.0.0.1");

        assertThat(mntners, hasSize(2));
        assertThat("TEST1-MNT", is(mntners.get(0).get("key")));
        assertThat("TEST2-MNT", is(mntners.get(1).get("key")));
    }

    @Test
    public void shouldFindMntnersForExactMatchingInetnum() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("inetnum", "193.0.0.1-193.255.255",
                RpslObject.parse("inetnum: 193.0.0.1 - 193.255.255\n" + "mnt-by:  TEST0-MNT\n"),
                Lists.newArrayList("inetnum"), "193.0.0.1-193.255.255",
                Lists.newArrayList(
                    RpslObject.parse("inetnum: 190.0.0.0 - 195.255.255.255\n" + "mnt-by: TEST2-MNT\n"),
                    RpslObject.parse("inetnum: 193.0.0.0 - 193.255.255.255\n" + "mnt-by: TEST1-MNT\n")
                ))
        );

        List<Map<String, Object>> mntners = subject.getMntnersToForceDelete("RIPE", "inetnum", "193.0.0.1-193.255.255");
        assertThat(mntners, hasSize(3));
        assertThat("TEST0-MNT", is(mntners.get(0).get("key")));
        assertThat("TEST1-MNT", is(mntners.get(1).get("key")));
        assertThat("TEST2-MNT", is(mntners.get(2).get("key")));
    }


    @Test
    public void shouldFindMntnersForInet6num() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("inet6num", "2001:FFFF:0000:0000::/60",
                RpslObject.parse("inet6num: 2001:FFFF:0000:0000::/60\n" + "mnt-by:  TEST0-MNT\n"),
                Lists.newArrayList("inet6num"), "2001:FFFF:0000:0000::/60",
                Lists.newArrayList(
                    RpslObject.parse("inet6num: 2001:FFFF:0000:0000::/48\n" + "mnt-by: TEST2-MNT\n"),
                    RpslObject.parse("inet6num: 2001:FFFF:0000:0000::/32\n" + "mnt-by: TEST1-MNT\n")
                ))
        );

        List<Map<String, Object>> mntners = subject.getMntnersToForceDelete("RIPE", "inet6num", "2001:FFFF:0000:0000::/60");
        assertThat(mntners, hasSize(3));
        assertThat("TEST0-MNT", is(mntners.get(0).get("key")));
        assertThat("TEST1-MNT", is(mntners.get(1).get("key")));
        assertThat("TEST2-MNT", is(mntners.get(2).get("key")));
    }

    @Test
    public void shouldFindMntnersForRoute() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("route", "193.0.0.1/21AS3333",
                RpslObject.parse("route: 193.0.0.1/21\n" + "origin: AS3333\n" + "mnt-by:  TEST0-MNT\n"),
                Lists.newArrayList("inetnum"), "193.0.0.1/21",
                Lists.newArrayList(
                    RpslObject.parse("inetnum: 190.0.0.0 - 195.255.255.255\n" + "mnt-by: TEST3-MNT\n"),
                    RpslObject.parse("inetnum: 193.0.0.0 - 193.255.255.255\n" + "mnt-by: TEST2-MNT\n"),
                    RpslObject.parse("route: 193.0.0.0/21\n" + "origin:AS3333\n" + "mnt-by: TEST1-MNT\n")
                ))
        );

        List<Map<String, Object>> mntners = subject.getMntnersToForceDelete("RIPE", "route", "193.0.0.1/21AS3333");

        assertThat(mntners, hasSize(4));
        assertThat("TEST0-MNT", is(mntners.get(0).get("key")));
        assertThat("TEST1-MNT", is(mntners.get(1).get("key")));
        assertThat("TEST2-MNT", is(mntners.get(2).get("key")));
        assertThat("TEST3-MNT", is(mntners.get(3).get("key")));
    }

    @Test
    public void shouldFindMntnersForRoute6() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("route6", "2001:FFFF:0000:0000::/60AS4444",
                RpslObject.parse("route6: 2001:FFFF:0000:0000::/60\n" + "origin: AS4444\n" + "mnt-by:  TEST0-MNT\n"),
                Lists.newArrayList("inet6num"), "2001:FFFF:0000:0000::/60",
                Lists.newArrayList(
                    RpslObject.parse("inet6num: 2001:FFFF:0000:0000::/48\n" + "mnt-by: TEST2-MNT\n"),
                    RpslObject.parse("inet6num: 2001:FFFF:0000:0000::/32\n" + "mnt-by: TEST1-MNT\n"),
                    RpslObject.parse("route6: 2001:FFFF:0000:0000::/60\n" + "origin:AS4444\n" + "mnt-by: TEST0-MNT\n")
                ))
        );

        List<Map<String, Object>> mntners = subject.getMntnersToForceDelete("RIPE", "route6", "2001:FFFF:0000:0000::/60AS4444");
        assertThat(mntners, hasSize(3));
        assertThat("TEST0-MNT", is(mntners.get(0).get("key")));
        assertThat("TEST1-MNT", is(mntners.get(1).get("key")));
        assertThat("TEST2-MNT", is(mntners.get(2).get("key")));
    }

    @Test
    public void shouldFindMntnersForExactMatchingDomain() {
        ForceDeleteService subject = new ForceDeleteService(
            setupRestClientTarget("domain", "200.193.193.in-addr.arpa",
                RpslObject.parse("domain: 200.193.193.in-addr.arpa\n" + "mnt-by:  TEST0-MNT\n"),
                Lists.newArrayList("inetnum", "inet6num"), "193.193.200.0/24",
                Lists.newArrayList(
                    RpslObject.parse("inetnum: 0.0.0.0 - 255.255.255.255\n" + "mnt-by: RIPE-NCC-RPSL-MNT\n"),
                    RpslObject.parse("inetnum: 193.0.0.0 - 195.255.255.255\n" + "mnt-by: TEST3-MNT\n"),
                    RpslObject.parse("inetnum: 193.193.192.0 - 193.193.223.255\n" + "mnt-domains: TEST2-MNT\n"),
                    RpslObject.parse("inetnum: 193.193.200.0 - 193.193.200.255\n" + "mnt-domains: TEST1-MNT\n")

                ))
        );

        List<Map<String, Object>> mntners = subject.getMntnersToForceDelete("RIPE", "domain", "200.193.193.in-addr.arpa");
        assertThat(mntners, hasSize(3));
        assertThat("TEST0-MNT", is(mntners.get(0).get("key")));
        assertThat("TEST1-MNT", is(mntners.get(1).get("key")));
        assertThat("TEST3-MNT", is(mntners.get(2).get("key")));
    }

    @Test
    public void shouldFindMntnersForNonExactMatchingip4Domain() {

    }


    private RestClientTarget setupRestClientTarget(final String lookupObjectType, final String lookupObjectName, final RpslObject exactMatch,
                                                   final List<String> searchObjectTypes, final String searchObjectName, final List<RpslObject> parents) {
        //final RestClientTarget restClientTarget = Mockito.mock(RestClientTarget.class, withSettings().verboseLogging());
        final RestClientTarget restClientTarget = Mockito.mock(RestClientTarget.class);

        if (exactMatch == null) {
            when(restClientTarget.lookup(ObjectType.getByNameOrNull(lookupObjectType), lookupObjectName)).thenThrow(
                new RestClientException(404, "ERROR:101: no entries found")
            );
        } else {
            when(restClientTarget.lookup(ObjectType.getByNameOrNull(lookupObjectType), lookupObjectName)).thenReturn(
                exactMatch
            );
        }
        when(restClientTarget.addParams("type-filter", searchObjectTypes)).thenReturn(restClientTarget);
        when(restClientTarget.addParam("query-string", searchObjectName)).thenReturn(restClientTarget);
        when(restClientTarget.addParams("flags", Lists.newArrayList("all-less", "no-irt", "no-filtering", "no-referenced"))).thenReturn(restClientTarget);
        when(restClientTarget.search()).thenReturn(parents);

        return restClientTarget;
    }
}
