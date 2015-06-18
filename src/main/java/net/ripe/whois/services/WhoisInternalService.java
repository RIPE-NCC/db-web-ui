package net.ripe.whois.services;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
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

import javax.ws.rs.core.MultivaluedHashMap;
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

    public ResponseEntity<String> getMaintainers(UUID uuid) {
        return restTemplate.exchange("{apiUrl}/api/user/{uuid}/maintainers?apiKey={apiKey}",
            HttpMethod.GET,
            new HttpEntity<>(createAcceptHeaders("application/json")),
            String.class,
            createParams(uuid));
    }

    private HashMap<String, Object> createParams(UUID uuid) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("apiKey", apiKey);
        variables.put("uuid", uuid);
        return variables;
    }

    private MultiValueMap<String, String> createAcceptHeaders(String accept) {
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", accept);
        headers.set("Content-type", accept);

        return headers;
    }

    public ResponseEntity<String> getMaintainersCompact(UUID uuid) {
        // fetch as xml
        ResponseEntity<WhoisResources> resp = restTemplate.exchange("{apiUrl}/api/user/{uuid}/maintainers?apiKey={apiKey}",
            HttpMethod.GET,
            new HttpEntity<>(createAcceptHeaders(MediaType.APPLICATION_XML_VALUE)),
            WhoisResources.class,
            createParams(uuid));

        List<Map<String,Object>> summaries = Lists.newArrayList();
        if (resp.getStatusCode() == HttpStatus.OK && resp.hasBody()) {
            for (WhoisObject obj : resp.getBody().getWhoisObjects()) {
                Map<String, Object> objectSummary = Maps.newHashMap();
                objectSummary.put("key", getObjectKey(obj));
                objectSummary.put("type", getObjectType(obj));
                objectSummary.put(AttributeType.AUTH.getName(), getValuesForAttribute(obj, AttributeType.AUTH));
                objectSummary.put("mine", true);
                summaries.add( objectSummary );
            }
        }
        String jsonString = new Gson().toJson(summaries);

        // make sure essentials headers are set
        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.CONTENT_LENGTH, String.valueOf(jsonString.length()));

        // Use gson to make java-map look like object
        return new ResponseEntity<String>(jsonString, headers, resp.getStatusCode());
    }

    private String getObjectKey(final WhoisObject obj) {
        List<Attribute> keyAttrs =  obj.getPrimaryKey();
        if( ! keyAttrs.isEmpty() ) {
            return keyAttrs.get(0).getValue();
        }

        return null;
    }

    private String getObjectType(final WhoisObject obj) {
        List<Attribute> keyAttrs =  obj.getPrimaryKey();
        if( ! keyAttrs.isEmpty() ) {
            return keyAttrs.get(0).getName();
        }

        return null;
    }

    private List<String> getValuesForAttribute(final WhoisObject obj, final AttributeType type) {
        List<String> values = Lists.newArrayList();
        for (Attribute attr : obj.getAttributes()) {
            if (attr.getName().equals(type.getName() )) {
                values.add(attr.getValue());
            }
        }
        return values;
    }

}
