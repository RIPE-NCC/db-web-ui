package net.ripe.whois.services;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import org.glassfish.jersey.client.ClientResponse;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.ws.rs.client.*;
import javax.ws.rs.core.MediaType;
import java.util.Arrays;
import java.util.List;

@Service
public class WhoisDomainObjectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectService.class);

    private String domainObjectApiUrl;

    private static final Client client;

    static {
        final JacksonJsonProvider jsonProvider = new JacksonJaxbJsonProvider()
                .configure(DeserializationFeature.UNWRAP_ROOT_VALUE, false)
                .configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);

        client = ClientBuilder.newBuilder()
                .register(MultiPartFeature.class)
                .register(jsonProvider)
                .build();
    }

    @Autowired
    public WhoisDomainObjectService(@Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.domainObjectApiUrl = ripeUrl;
    }

    public ResponseEntity<WhoisResources> createDomainObjects(final String source, String[] passwords, final List<WhoisObject> domainObjects, final HttpHeaders headers) {

        WhoisResources whoisResources = new WhoisResources();
        whoisResources.setWhoisObjects(domainObjects);

        String passwdQueryString = "";
        if (passwords != null && passwords.length > 0) {
            passwdQueryString = "?password=" + String.join("&password=", Arrays.asList(passwords));
        }
        WebTarget target = client.target(domainObjectApiUrl).path("/whois/domain-objects/" + source + passwdQueryString);
        Invocation.Builder builder = target.request();
        builder.header(HttpHeaders.COOKIE, headers.get(HttpHeaders.COOKIE));
        builder.header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_TYPE);
        ClientResponse response = builder.post(Entity.entity(whoisResources, MediaType.APPLICATION_JSON_TYPE), ClientResponse.class);
        LOGGER.info("Whois responded with status: " + response.getStatus());
        return new ResponseEntity<>((WhoisResources) response.getEntity(), HttpStatus.CREATED);
    }

}
