package net.ripe.whois.services;

import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientException;
import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.whois.services.rest.RestClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriTemplate;

import java.net.URI;
import java.util.HashMap;
import java.util.List;

@Service
public class WhoisSearchService extends RestClient {

    private final String apiUrl;

    @Autowired
    public WhoisSearchService(@Value("${rest.api.ripeUrl}") final String ripeUrl) {
        this.apiUrl = ripeUrl+"/search";
    }

    public List<WhoisObject> getReferences(InverseQuery query, String source, String queryString) {

        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Accept", MediaType.APPLICATION_XML_VALUE);

        final ResponseEntity<WhoisResources> response = restTemplate.exchange(getReferencesUrlFor(query, source, queryString),
            HttpMethod.GET,
            new HttpEntity<String>(headers),
            WhoisResources.class);

        if (response.getStatusCode() != HttpStatus.OK && response.getStatusCode() != HttpStatus.NOT_FOUND) {
            throw new RestClientException(response.getBody().getErrorMessages());
        }

        return response.getBody().getWhoisObjects();
    }

    public URI getReferencesUrlFor(InverseQuery query, String source, String queryString) {

        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("apiUrl", apiUrl);
        variables.put("source", source);
        variables.put("query-string", queryString);

        return new UriTemplate("{apiUrl}"+query.getQueryParams()).expand(variables);

    }

    public enum InverseQuery {

        AS_SET("?inverse-attribute=mo&flags=r&source={source}&query-string={query-string}"),
        AUT_NUM("?inverse-attribute=la&inverse-attribute=or&flags=r&source={source}&query-string={query-string}"),
        INET6NUM("?type-filter=route6&flags=r&source={source}&query-string={query-string}"),
        INETNUM("?type-filter=route&flags=r&source={source}&query-string={query-string}"),
        IRT("?inverse-attribute=mi&flags=r&source={source}&query-string={query-string}"),
        KEY_CERT("?inverse-attribute=at&flags=r&source={source}&query-string={query-string}"),
        MNTNER("?inverse-attribute=mr&inverse-attribute=mb&inverse-attribute=md&inverse-attribute=ml&inverse-attribute=mu&inverse-attribute=mz&flags=r&source={source}&query-string={query-string}"),
        ORGANISATION("?inverse-attribute=org&flags=r&source={source}&query-string={query-string}"),
        PERSON("?inverse-attribute=pn&inverse-attribute=ac&inverse-attribute=tc&inverse-attribute=zc&flags=r&source={source}&query-string={query-string}"),
        ROLE("?inverse-attribute=pn&inverse-attribute=ac&inverse-attribute=tc&inverse-attribute=zc&flags=r&source={source}&query-string={query-string}"),
        ROUTE("?type-filter=inetnum&flags=r&source={source}&query-string={query-string}"),
        ROUTE6("?type-filter=inet6num&flags=r&source={source}&query-string={query-string}"),
        ROUTE_SET("?inverse-attribute=mo&flags=r&source={source}&query-string={query-string}"),
        RTR_SET("?inverse-attribute=mo&flags=r&source={source}&query-string={query-string}");

        private final String queryParams;

        private InverseQuery(String queryParams) {
            this.queryParams = queryParams;
        }

        public String getQueryParams() {
            return queryParams;
        }
    }
}


