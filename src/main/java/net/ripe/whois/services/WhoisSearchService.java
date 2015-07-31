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

        URI uri = new UriTemplate("{url}" + query.getApiQueryParams()).expand(getParamsMap(apiUrl, source, queryString));

        final ResponseEntity<WhoisResources> response = restTemplate.exchange(uri,
            HttpMethod.GET,
            new HttpEntity<String>(headers),
            WhoisResources.class);

        if (response.getStatusCode() != HttpStatus.OK && response.getStatusCode() != HttpStatus.NOT_FOUND) {
            throw new RestClientException(response.getBody().getErrorMessages());
        }

        return response.getBody().getWhoisObjects();
    }

    public URI getReferencesUrlFor(String url, InverseQuery query, String source, String queryString) {
        return new UriTemplate("{url}"+query.getWebQueryParams()).expand(getParamsMap(url, source, queryString));
    }

    private HashMap<String, Object> getParamsMap(String apiUrl, String source, String queryString) {
        final HashMap<String, Object> variables = Maps.newHashMap();
        variables.put("url", apiUrl);
        variables.put("source", source);
        variables.put("query-string", queryString);
        return variables;
    }

    public enum InverseQuery {

        AS_SET("?inverse-attribute=mo&flags=r&source={source}&query-string={query-string}",
            "?inverse=member-of&rflag=true&source={source}&searchtext={query-string}"),

        AUT_NUM("?inverse-attribute=la&inverse-attribute=or&flags=r&source={source}&query-string={query-string}",
            "?inverse=local-as;origin&rflag=true&source={source}&searchtext={query-string}"),

        INET6NUM("?type-filter=route6&flags=r&source={source}&query-string={query-string}",
            "?types=route6&rflag=true&source={source}&searchtext={query-string}"),

        INETNUM("?type-filter=route&flags=r&source={source}&query-string={query-string}",
            "?types=route&rflag=true&source={source}&searchtext={query-string}"),

        IRT("?inverse-attribute=mi&flags=r&source={source}&query-string={query-string}",
            "?inverse=mnt-irt&rflag=true&source={source}&searchtext={query-string}"),

        KEY_CERT("?inverse-attribute=at&flags=r&source={source}&query-string={query-string}",
            "?inverse=auth&rflag=true&source={source}&searchtext={query-string}"),

        MNTNER("?inverse-attribute=mr&inverse-attribute=mb&inverse-attribute=md&inverse-attribute=ml&inverse-attribute=mu&inverse-attribute=mz&flags=r&source={source}&query-string={query-string}",
            "?inverse=mbrs-by-ref;mnt-by;mnt-domains;mnt-lower;mnt-routes;mnt-routes&rflag=true&source={source}&searchtext={query-string}"),

        ORGANISATION("?inverse-attribute=org&flags=r&source={source}&query-string={query-string}",
            "?inverse=org&rflag=true&source={source}&searchtext={query-string}"),

        PERSON("?inverse-attribute=pn&inverse-attribute=ac&inverse-attribute=tc&inverse-attribute=zc&flags=r&source={source}&query-string={query-string}",
            "?inverse=person;admin-c;tech-c;zone-c&rflag=true&source={source}&searchtext={query-string}"),

        ROLE("?inverse-attribute=pn&inverse-attribute=ac&inverse-attribute=tc&inverse-attribute=zc&flags=r&source={source}&query-string={query-string}",
            "?inverse=person;admin-c;tech-c;zone-c&rflag=true&source={source}&searchtext={query-string}"),

        ROUTE("?type-filter=inetnum&flags=r&source={source}&query-string={query-string}",
            "?types=inetnum&rflag=true&source={source}&searchtext={query-string}"),
        ROUTE6("?type-filter=inet6num&flags=r&source={source}&query-string={query-string}",
            "?types=inet6num&rflag=true&source={source}&searchtext={query-string}"),

        ROUTE_SET("?inverse-attribute=mo&flags=r&source={source}&query-string={query-string}",
            "?inverse=member-of&rflag=true&source={source}&searchtext={query-string}"),

        RTR_SET("?inverse-attribute=mo&flags=r&source={source}&query-string={query-string}",
            "?inverse=member-of&rflag=true&source={source}&searchtext={query-string}");

        private final String apiQueryParams;
        private final String webQueryParams;

        private InverseQuery(String apiQueryParams, String webQueryParams) {

            this.apiQueryParams = apiQueryParams;
            this.webQueryParams = webQueryParams;
        }

        public String getApiQueryParams() {
            return apiQueryParams;
        }

        public String getWebQueryParams() {
            return webQueryParams;
        }

    }
}


