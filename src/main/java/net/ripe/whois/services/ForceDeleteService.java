package net.ripe.whois.services;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.client.RestClientTarget;
import net.ripe.db.whois.api.rest.domain.ErrorMessage;
import net.ripe.db.whois.common.ip.IpInterval;
import net.ripe.db.whois.common.rpsl.AttributeType;
import net.ripe.db.whois.common.rpsl.ObjectType;
import net.ripe.db.whois.common.rpsl.RpslAttribute;
import net.ripe.db.whois.common.rpsl.RpslObject;
import net.ripe.db.whois.common.rpsl.attrs.Domain;
import net.ripe.whois.services.rest.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class ForceDeleteService extends RestClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(ForceDeleteService.class);
    private final static List<String> IP_RESOURCE_TYPES = Lists.newArrayList("inetnum", "inet6num", "route", "route6", "domain");
    private final static Map<String, List<String>> SEARCH_TYPES_FOR_OBJECT_TYPE = Maps.newHashMap(ImmutableMap.of(
        "inetnum", Lists.newArrayList("inetnum"),
        "inet6num", Lists.newArrayList("inet6num"),
        "route", Lists.newArrayList("inetnum"),
        "route6", Lists.newArrayList("inet6num"),
        "domain", Lists.newArrayList("inetnum", "inet6num")
    ));

    private RestClientTarget restClient;

    public ForceDeleteService(final RestClientTarget restClient) {
        this.restClient = restClient;
    }

    public List<Map<String, Object>> getMntnersToForceDelete(final String source, final String objectType, final String objectName) {
        LOGGER.warn("Search for mntners to force-delete object {}/{}/{}", source, objectType, objectName);

        Preconditions.checkArgument(source != null);
        Preconditions.checkArgument(objectType != null);
        Preconditions.checkArgument(objectName != null);

        try {
            // validate
            ObjectType type = ObjectType.getByNameOrNull(objectType);
            if (objectName == null) {
                throw new RestClientException(400, String.format("Unknown object-type %s", objectType));
            }
            String ipResourceName = getIpResource(objectType, objectName);
            if (ipResourceName == null) {
                throw new RestClientException(400, String.format("Invalid object-name %s", objectType));
            }

            // Get mntners of exact match
            List<String> authenticationCandidates = getObjectMntners(source, type, objectName);
            if (isIpResource(objectType)) {
                // Look for mnters of parent resources
                addIfNotExists(authenticationCandidates,
                    getParentMntners(source, objectType, objectName)
                );
            }

            List<String> stripped = stripRipeMntners(authenticationCandidates);

            // return response
            return wrapIntoObjects(stripped);

        } catch (Exception exc) {
            LOGGER.warn("Error getting mntners to force-delete object {}/{}/{}:{}", source, objectType, objectName, exc);
            throw new RestClientException(400, exc);
        }
    }

    private List<String> getObjectMntners(final String source, final ObjectType objectType, final String objectName) {

        Preconditions.checkArgument(source != null);
        Preconditions.checkArgument(objectType != null);
        Preconditions.checkArgument(objectName != null);

        try {
            final RpslObject result = restClient.lookup(objectType, objectName);
            if (result == null) {
                LOGGER.info("No exact match");
            } else {
                LOGGER.info("Exact match {}", result);
                List<String> authCandidates = getAttrsOnType(result, AttributeType.MNT_BY);
                LOGGER.info("Object mntners:{}", authCandidates);
                return authCandidates;
            }
        } catch (RestClientException exc) {
            LOGGER.warn("Error fetching object parents {}/{}/{}", source, objectType, objectName);
            logErrors(exc);
        }
        return Lists.newArrayList();
    }

    private void logErrors(RestClientException exc) {
        for (ErrorMessage em : exc.getErrorMessages()) {
            LOGGER.warn("error: {}", em.toString());
        }
    }

    private boolean isIpResource(final String objectType) {

        Preconditions.checkArgument(objectType != null);

        return IP_RESOURCE_TYPES.contains(objectType);
    }

    private List<String> getParentMntners(final String source, final String objectType, final String objectName) {

        Preconditions.checkArgument(source != null);
        Preconditions.checkArgument(objectType != null);
        Preconditions.checkArgument(objectName != null);

        try {
            String ipResourceName = getIpResource(objectType, objectName);

            final List<String> objectTypesToSearchFor = SEARCH_TYPES_FOR_OBJECT_TYPE.get(objectType);
            LOGGER.info("Search for {} resources with name {}", objectTypesToSearchFor, ipResourceName);

            final Collection<RpslObject> results =
                restClient
                    .addParams("type-filter", objectTypesToSearchFor)
                    .addParam("query-string", ipResourceName)
                    .addParams("flags", Lists.newArrayList("all-less", "no-irt", "no-filtering", "no-referenced"))
                    .search();

            final List<RpslObject> searchResults = filterAndReverse(results);
            for (RpslObject obj : searchResults) {
                LOGGER.debug("Less specific match {}", obj);
            }
            return extractParentMntners(objectType, objectName, ipResourceName, searchResults);
        } catch (RestClientException exc) {
            LOGGER.warn("Error fetching object parents {}/{}/{}", source, objectType, objectName);
            logErrors(exc);
            return Collections.emptyList();
        } catch (Exception exc) {
            LOGGER.warn("Error fetching object parents {}/{}/{}", source, objectType, objectName);
            return Collections.emptyList();
        }
    }

    private List<RpslObject> filterAndReverse(Collection<RpslObject> results) {

        Preconditions.checkArgument(results != null);

        return Lists.reverse(Lists.newArrayList(results));
    }

    private String getIpResource(final String objectType, final String objectName) {

        Preconditions.checkArgument(objectType != null);
        Preconditions.checkArgument(objectName != null);

        String ipResource = null;
        if (objectType.equals("inetnum") || objectType.equals("inet6num")) {
            // just verify if would parse
            IpInterval.parse(objectName);
            ipResource = objectName;
        } else if (objectType.equals("route") || objectType.equals("route6")) {
            ipResource = stripAsFromRoute(objectName);
        } else if (objectType.equals("domain")) {
            IpInterval interval = Domain.parse(objectName).getReverseIp();
            ipResource = interval.toString();
        }
        return ipResource;
    }

    private String stripAsFromRoute(String objectName) {

        Preconditions.checkArgument(objectName != null);

        String value = null;
        try {
            String[] splitted = objectName.split("AS");
            if (splitted.length > 0) {
                IpInterval.parse(splitted[0]);
                return splitted[0];
            }
        } catch (Exception esc) {
        }
        return value;
    }

    private List<String> extractParentMntners(final String objectType, final String objectName,
                                              final String ipResourceName, final List<RpslObject> searchResults) {

        Preconditions.checkArgument(objectType != null);
        Preconditions.checkArgument(objectName != null);
        Preconditions.checkArgument(ipResourceName != null);
        Preconditions.checkArgument(searchResults != null);

        LOGGER.info("extractParentMntners input: {}/{}/{}", objectType, objectName, ipResourceName);

        // specific rules for domain
        List<String> authCandidates = extractMntDomainsForDomain(objectType, objectName, ipResourceName, searchResults);

        // Add parent mnt-byes
        addIfNotExists(authCandidates,
            extractMntByes(searchResults)
        );

        LOGGER.info("extractParentMntners result:{}", authCandidates);

        return authCandidates;
    }

    private List<String> extractMntByes(final List<RpslObject> searchResults) {
        return getAllAttrsOnType(searchResults, AttributeType.MNT_BY);
    }

    private List<String> extractMntDomainsForDomain(final String objectType, final String objectName, final String ipResourceName, final List<RpslObject> searchResults) {
        final List<String> authCandidates = Lists.newArrayList();

        Preconditions.checkArgument(objectType != null);
        Preconditions.checkArgument(objectName != null);
        Preconditions.checkArgument(ipResourceName != null);
        Preconditions.checkArgument(searchResults != null);

        LOGGER.info("extractMntDomainsForDomain: {}/{}/{}", objectType, objectName, ipResourceName);

        if (objectType.equals("domain")) {
            LOGGER.info("*********** domain ****************");

            IpInterval objectPrefix = Domain.parse(objectName).getReverseIp();

            String domainIp = getIpResource("domain", objectName);
            // find exact matching prefix
            if (searchResults.size() > 0) {
                RpslObject parent = searchResults.get(0);
                IpInterval parentPrefix = IpInterval.parse(parent.getKey());
                if (objectPrefix.equals(parentPrefix)) {
                    // exact match
                    LOGGER.info("parent:" + parent.getFormattedKey());
                    LOGGER.info("Object prefix:" + objectPrefix);
                    LOGGER.info("Parent prefix:" + parentPrefix);
                    addIfNotExists(authCandidates, getAttrsOnType(parent, AttributeType.MNT_DOMAINS));
                }
            }
            addIfNotExists(authCandidates, getAllAttrsOnType(searchResults, AttributeType.MNT_BY));

        }

        return authCandidates;
    }

    private List<String> getAllAttrsOnType(final List<RpslObject> searchResults, final AttributeType attributeType) {
        final List<String> allAttrValues = Lists.newArrayList();

        Preconditions.checkArgument(searchResults != null);
        Preconditions.checkArgument(attributeType != null);

        for (RpslObject obj : searchResults) {
            addIfNotExists(allAttrValues, getAttrsOnType(obj, attributeType));
        }
        return allAttrValues;
    }

    private List<String> getAttrsOnType(final RpslObject obj, final AttributeType attributeType) {
        final List<String> allAttrValues = Lists.newArrayList();

        Preconditions.checkArgument(obj != null);
        Preconditions.checkArgument(attributeType != null);

        List<RpslAttribute> attrs = obj.findAttributes(attributeType);
        for (RpslAttribute attr : attrs) {
            allAttrValues.add(attr.getCleanValue().toString());
        }

        return allAttrValues;
    }

    private void addIfNotExists(final List<String> existingItems, final List<String> newItems) {

        Preconditions.checkArgument(existingItems != null);
        Preconditions.checkArgument(newItems != null);

        for (String newItem : newItems) {
            if (!existingItems.contains(newItem)) {
                existingItems.add(newItem);
            }
        }
    }

    private List<String> stripRipeMntners( final List<String> mntners ) {
        final List<String> stripped = Lists.newArrayList();

        Preconditions.checkArgument(mntners != null);

        for( String mntnerName: mntners ) {
            if( !mntnerName.toUpperCase().startsWith("RIPE-NCC-")) {
                stripped.add( mntnerName);
            }
        }
        return stripped;
    }

    private List<Map<String, Object>> wrapIntoObjects(final List<String> authcandodates) {
        final List<Map<String, Object>> response = Lists.newArrayList();

        Preconditions.checkArgument(authcandodates != null);

        final List<String> mntners = Lists.newArrayList();
        for (String mntnerName : authcandodates) {
            if (!mntners.contains(mntnerName)) {
                Map<String, Object> mntner = Maps.newHashMap();
                mntner.put("key", mntnerName);
                mntner.put("type", "mntner");
                mntner.put("mine", false);
                response.add(mntner);
                mntners.add(mntnerName);
            }
        }
        return response;
    }


}


