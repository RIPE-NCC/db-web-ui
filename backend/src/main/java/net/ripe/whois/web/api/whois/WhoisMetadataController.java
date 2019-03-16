package net.ripe.whois.web.api.whois;

import net.ripe.db.whois.common.rpsl.ObjectTemplate;
import net.ripe.db.whois.common.rpsl.ObjectType;
import net.ripe.whois.web.api.ApiController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/metadata")
public class WhoisMetadataController extends ApiController {

    @GetMapping(value = "/templates/{objectType}", consumes = MediaType.ALL_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getWhoisTemplate(@PathVariable String objectType) {
        return ResponseEntity.ok(ObjectTemplate.getTemplate(ObjectType.getByName(objectType)).toString());
    }

    @GetMapping(value = "/verboses/{objectType}", consumes = MediaType.ALL_VALUE, produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getWhoisVerbose(@PathVariable String objectType) {
        return ResponseEntity.ok(ObjectTemplate.getTemplate(ObjectType.getByName(objectType)).toVerboseString());
    }
}
