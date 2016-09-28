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

import javax.ws.rs.BadRequestException;
import javax.ws.rs.ProcessingException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.client.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

@Service
public class WhoisDomainObjectService {
    private static final Logger LOGGER = LoggerFactory.getLogger(WhoisDomainObjectService.class);

    private final String domainObjectApiUrl;
    private final String whoisBulkDomainCreatePath;
    private final String contextPath;
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
    public WhoisDomainObjectService(
            @Value("${rest.api.ripeUrl}") final String ripeUrl,
            @Value("${whois.bulk.domain.create.path}") final String whoisBulkDomainCreatePath,
            @Value("${server.contextPath}") final String contextPath) {

        this.domainObjectApiUrl = ripeUrl;
        this.whoisBulkDomainCreatePath = whoisBulkDomainCreatePath;
        this.contextPath = contextPath;
    }

    public ResponseEntity<WhoisResources> createDomainObjects(final String source, String[] passwords, final List<WhoisObject> domainObjects, final HttpHeaders headers) {

        WhoisResources whoisResources = new WhoisResources();
        whoisResources.setWhoisObjects(domainObjects);

        WebTarget target = client.target(domainObjectApiUrl).path(whoisBulkDomainCreatePath + "/" + source);
        if (passwords != null && passwords.length > 0) {
            target.queryParam("password", passwords);
        }
        Invocation.Builder builder = target.request();
        builder.header(HttpHeaders.COOKIE, headers.get(HttpHeaders.COOKIE));
        builder.header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_TYPE);
        ClientResponse response = null;
        try {
            response = builder.post(Entity.entity(whoisResources, MediaType.APPLICATION_JSON_TYPE), ClientResponse.class);
            return new ResponseEntity<>((WhoisResources) response.getEntity(), HttpStatus.CREATED);
        } catch (BadRequestException e) {
            return new ResponseEntity<>(e.getResponse().readEntity(WhoisResources.class), HttpStatus.valueOf(e.getResponse().getStatus()));
        } catch (WebApplicationException | ProcessingException e) {
            if (response != null) {
                return new ResponseEntity<>((WhoisResources) response.getEntity(), HttpStatus.valueOf(response.getStatus()));
            }
        }
        return null;
    }

}
