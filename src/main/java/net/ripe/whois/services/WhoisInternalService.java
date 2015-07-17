package net.ripe.whois.services;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.domain.Attribute;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.db.whois.common.rpsl.AttributeType;
import net.ripe.whois.services.rest.RestClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WhoisInternalService extends RestClient {

    private final String apiUrl;
    private final String apiKey;

    @Autowired
    public WhoisInternalService(@Value("${internal.api.url}") final String apiUrl, @Value("${internal.api.key}") final String apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }

    public List<Map<String,Object>> getMaintainers(final UUID uuid) {

        // fetch as xml
        final ResponseEntity<WhoisResources> response = restTemplate.exchange("{apiUrl}/api/user/{uuid}/maintainers?apiKey={apiKey}",
            HttpMethod.GET,
            new HttpEntity<String>(withHeaders(MediaType.APPLICATION_XML_VALUE)),
            WhoisResources.class,
            withParams(uuid));

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RestClientException(response.getBody().getErrorMessages());
        }

        // use big whois-resources-resp to compose small compact response that looks like autocomplete-service
        final List<Map<String, Object>> summaries = Lists.newArrayList();
        if (response.getStatusCode() == HttpStatus.OK && response.hasBody()) {
            for (WhoisObject obj : response.getBody().getWhoisObjects()) {
                Map<String, Object> objectSummary = Maps.newHashMap();
                objectSummary.put("key", getObjectKey(obj));
                objectSummary.put("type", getObjectType(obj));
                objectSummary.put(AttributeType.AUTH.getName(), getValuesForAttribute(obj, AttributeType.AUTH));
                objectSummary.put("mine", true);
                summaries.add(objectSummary);
            }
        }

        return summaries;
    }

    private HashMap<String, Object> withParams(final UUID uuid) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("apiKey", apiKey);
        variables.put("uuid", uuid);
        return variables;
    }

    private MultiValueMap<String, String> withHeaders(final String accept) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", accept);
        return headers;
    }

    private String getObjectKey(final WhoisObject obj) {
        List<Attribute> keyAttrs = obj.getPrimaryKey();
        if (!keyAttrs.isEmpty()) {
            return keyAttrs.get(0).getValue();
        }

        return null;
    }

    private String getObjectType(final WhoisObject obj) {
        List<Attribute> keyAttrs = obj.getPrimaryKey();
        if (!keyAttrs.isEmpty()) {
            return keyAttrs.get(0).getName();
        }

        return null;
    }

    private List<String> getValuesForAttribute(final WhoisObject obj, final AttributeType type) {
        List<String> values = Lists.newArrayList();
        for (Attribute attr : obj.getAttributes()) {
            if (attr.getName().equals(type.getName())) {
                values.add(attr.getValue());
            }
        }
        return values;
    }

}
