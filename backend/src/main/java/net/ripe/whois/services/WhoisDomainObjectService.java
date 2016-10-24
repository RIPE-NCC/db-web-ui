package net.ripe.whois.services;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import com.fasterxml.jackson.jaxrs.json.JacksonJsonProvider;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import org.glassfish.jersey.media.multipart.MultiPartFeature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.ws.rs.ClientErrorException;
import javax.ws.rs.client.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Service
public class WhoisDomainObjectService {

    private final String domainObjectApiUrl;
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
        LOGGER.debug("Set domainObjectApiUrl to " + this.domainObjectApiUrl);
    }

    public ResponseEntity<WhoisResources> createDomainObjects(final String source, String[] passwords, final List<WhoisObject> domainObjects, final HttpHeaders headers) {

        final WhoisResources whoisResources = new WhoisResources();
        whoisResources.setWhoisObjects(domainObjects);

        final WebTarget target = client.target(domainObjectApiUrl).path("/domain-objects/" + source);
        if (passwords != null && passwords.length > 0) {
            target.queryParam("password", passwords);
        }
        LOGGER.debug("createDomainObjects() url: " + target.getUri().toString());
        final Invocation.Builder builder = target.request();
        builder.header(HttpHeaders.COOKIE, headers.get(HttpHeaders.COOKIE));
        builder.header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_TYPE);

        // Do not accept compressed response, as it's not handled properly (by whois)
        builder.header(HttpHeaders.ACCEPT_ENCODING, "identity");

        try {
            final Response response = builder.post(Entity.entity(whoisResources, MediaType.APPLICATION_JSON_TYPE), Response.class);
            LOGGER.debug("createDomainObjects() successful post. Response: " + response.getStatus());
            return new ResponseEntity<>(response.readEntity(WhoisResources.class), HttpStatus.valueOf(response.getStatus()));
        } catch (ClientErrorException e) {
            LOGGER.error("createDomainObjects() caught ClientErrorException during post.", e);
            return new ResponseEntity<>(e.getResponse().readEntity(WhoisResources.class), HttpStatus.valueOf(e.getResponse().getStatus()));
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectService.class);

}
