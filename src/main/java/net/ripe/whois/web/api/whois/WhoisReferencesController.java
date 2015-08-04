package net.ripe.whois.web.api.whois;

import net.ripe.db.whois.api.rest.domain.WhoisObject;
import net.ripe.whois.services.WhoisSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/references")
public class WhoisReferencesController {

    @Autowired
    private WhoisSearchService whoisSearchService;

    @Value("${ripe.search.queryUrl}")
    private String queryUrl;

    private int MAX_RESULT_NUMBER = 5;

    @RequestMapping(value = "/{source}/{objectType}/{name}", method = RequestMethod.GET)
    public Map<String, Object> search(@PathVariable String source, @PathVariable String objectType,
                                      @PathVariable String name) throws URISyntaxException {
        final List<WhoisObject> selectedReferences;

        final WhoisSearchService.InverseQuery query = WhoisSearchService.InverseQuery.valueOf(objectType.toUpperCase());
        final List<WhoisObject> references = whoisSearchService.getReferences(query, source, name);

        if(references.size() < MAX_RESULT_NUMBER) {
            selectedReferences = references;
        } else {
            selectedReferences = references.subList(0, MAX_RESULT_NUMBER);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("total", references.size());
        response.put("subset", selectedReferences.size());
        response.put("references", selectedReferences);
        response.put("query", whoisSearchService.getReferencesUrlFor(queryUrl, query, source, name));

        return response;
    }

}
