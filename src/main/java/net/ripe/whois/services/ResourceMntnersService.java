package net.ripe.whois.services;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.client.RestClientUtils;
import net.ripe.db.whois.common.rpsl.AttributeType;
import net.ripe.db.whois.common.rpsl.RpslAttribute;
import net.ripe.db.whois.common.rpsl.RpslObject;
import net.ripe.whois.services.rest.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
public class ResourceMntnersService extends RestClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(ResourceMntnersService.class);

    private String whoisApiUrl;

    @Autowired
    public ResourceMntnersService(@Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.whoisApiUrl = ripeUrl;
    }

    @Autowired
    public ResponseEntity getMntnersForResource(String source, String objectType, String objectName) {
        LOGGER.debug("Performing search for mntners of resoource {}/{}/{}", source, objectType, objectName);

        try {
            final List<String> mntners = Lists.newArrayList();
            final List<Map<String, Object>> response = Lists.newArrayList();

            final Collection<RpslObject> searchResults =
                RestClientUtils.createRestClient(whoisApiUrl, source).request()
                    .addParam("type-filter", objectType)
                    .addParam("query-string", objectName)
                    .addParams("flags", Lists.newArrayList("all-less", "no-irt", "no-filtering", "no-referenced"))
                    .search();
            for (RpslObject obj : searchResults) {
                List<RpslAttribute> mntnerAttrs = obj.findAttributes(AttributeType.MNT_BY);
                for (RpslAttribute attr : mntnerAttrs) {
                    if (!mntners.contains(attr.getValue())) {
                        Map<String, Object> mntner = Maps.newHashMap();
                        mntner.put("key", attr.getValue());
                        mntner.put("type", "mntner");
                        mntner.put("mine", false);
                        response.add(mntner);
                        mntners.add(attr.getValue());
                    }
                }
            }
            final MultiValueMap<String, String> headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
            return new ResponseEntity<>(response, headers, HttpStatus.OK);

        } catch (RestClientException e) {
            LOGGER.warn("Error searching for parent mntners: {}", e);
            throw new RestClientException(e);
        }
    }

}


