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
        return headers;
    }

    public ResponseEntity<String> getMaintainersCompact(UUID uuid) {
        // fetch as xml
        ResponseEntity<WhoisResources> resp = restTemplate.exchange("{apiUrl}/api/user/{uuid}/maintainers?apiKey={apiKey}",
            HttpMethod.GET,
            new HttpEntity<>(createAcceptHeaders(MediaType.APPLICATION_XML_VALUE)),
            WhoisResources.class,
            createParams(uuid));

        // extract essental info from the response
        List<ObjectSummary> summaries = Lists.newArrayList();
        if (resp.getStatusCode() == HttpStatus.OK && resp.hasBody()) {
            for (WhoisObject obj : resp.getBody().getWhoisObjects()) {
                Map<String, Object> extras = Maps.newHashMap();
                extras.put("md5", hasAttributeWithValue(obj, AttributeType.AUTH, "MD5"));
                extras.put("pgp", hasAttributeWithValue(obj, AttributeType.AUTH, "PGP"));
                extras.put("sso", hasAttributeWithValue(obj, AttributeType.AUTH, "SSO"));
                extras.put("mine", true);
                summaries.add(new ObjectSummary(getFirstAttributeOfType(obj, AttributeType.MNTNER), extras));
            }
        }

        // replace accept from xml to json
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.setAccept(Lists.newArrayList(MediaType.APPLICATION_JSON));

        return new ResponseEntity<String>(new Gson().toJson(summaries),
            responseHeaders,
            resp.getStatusCode());
    }

    private boolean hasAttributeWithValue(WhoisObject obj, AttributeType type, String valueToMatch) {
        for (Attribute attr : obj.getAttributes()) {
            if (attr.getName().equals(type.getName()) && attr.getValue().contains(valueToMatch)) {
                return true;
            }
        }
        return false;
    }

    private String getFirstAttributeOfType(WhoisObject obj, AttributeType type) {
        for (Attribute attr : obj.getAttributes()) {
            if (attr.getName().equals(type.getName())) {
                return attr.getValue();
            }
        }
        return null;
    }
}
