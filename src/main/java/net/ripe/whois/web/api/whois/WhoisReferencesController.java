package net.ripe.whois.web.api.whois;

import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.db.whois.api.rest.domain.WhoisResources;
import net.ripe.whois.services.WhoisReferencesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/references")
public class WhoisReferencesController {

    @Autowired
    private WhoisReferencesService whoisReferencesService;

    @Value("${ripe.search.queryUrl}")
    private String queryUrl;

    private int MAX_RESULT_NUMBER = 5;

    @RequestMapping(value = "/{source}/{objectType}/{name}", method = RequestMethod.GET)
    public Map<String, Object> search(@PathVariable String source, @PathVariable String objectType,
                                      @PathVariable String name) throws URISyntaxException {
        final List<WhoisObject> selectedReferences;

        final WhoisReferencesService.InverseQuery query = WhoisReferencesService.InverseQuery.valueOf(objectType.toUpperCase());
        final List<WhoisObject> references = whoisReferencesService.getReferences(query, source, name);

        if(references.size() < MAX_RESULT_NUMBER) {
            selectedReferences = references;
        } else {
            selectedReferences = references.subList(0, MAX_RESULT_NUMBER);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("total", references.size());
        response.put("subset", selectedReferences.size());
        response.put("references", selectedReferences);
        response.put("query", query.getReferencesUrlFor(queryUrl, source, name));

        return response;
    }

    @RequestMapping(value = "/{source}/{objectType}/{name}", method = RequestMethod.DELETE)
    public ResponseEntity<WhoisResources>  delete(@PathVariable String source, @PathVariable String objectType,
        @PathVariable String name, @RequestHeader final HttpHeaders headers) throws URISyntaxException {

        headers.remove(com.google.common.net.HttpHeaders.HOST);

        return whoisReferencesService.deleteObjectAndReferences(objectType, source, name, headers);
    }

}
