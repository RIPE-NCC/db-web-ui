package net.ripe.whois.web.api.whois;

import net.ripe.db.whois.common.rpsl.ObjectTemplate;
import net.ripe.db.whois.common.rpsl.ObjectType;
import net.ripe.db.whois.query.QueryFlag;
import net.ripe.whois.web.api.ApiController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Arrays;
import java.util.List;

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

    @GetMapping(value = "/help", consumes = MediaType.ALL_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Flag>> getHelpFlags() {
        return ResponseEntity.ok(Arrays.stream(QueryFlag.values()).map(f -> {
            List<String> flags = Arrays.asList(f.toString().split(", "));
            if (flags.size() > 1) {
                return new Flag(flags.get(0), flags.get(1), f.getDescription());
            } else {
                String flag = flags.get(0);
                boolean hasJustLongFlag = flags.get(0).contains("--");
                return new Flag(hasJustLongFlag ? "" : flag,
                        hasJustLongFlag ? flag : "",
                        f.getDescription());
            }
        }).toList());
    }


}
