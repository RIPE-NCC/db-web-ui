package net.ripe.whois.web.api.rpki;

import net.ripe.whois.services.RpkiValidatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rpki")
@SuppressWarnings("UnusedDeclaration")
public class RpkiValidatorController {
    private final RpkiValidatorService rpkiValidatorService;

    @Autowired
    public RpkiValidatorController(final RpkiValidatorService rpkiValidatorService) {
        this.rpkiValidatorService = rpkiValidatorService;
    }

    @RequestMapping(value = "/roa", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE )
    public ResponseEntity<String> getRoaValidity(@RequestParam("origin") final String origin,
                                 @RequestParam("route") final String route) {

        return ResponseEntity.ok().body(rpkiValidatorService.getRoaValidity(origin, route));
    }

}

