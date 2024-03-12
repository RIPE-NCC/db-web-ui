package net.ripe.whois.web.api.whois;

import net.ripe.whois.services.CachingSessionChecker;
import net.ripe.whois.services.WhoisInternalService;
import net.ripe.whois.web.api.ApiController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/api/unsubscribe")
public class UnsubscribeController extends ApiController {

    private final WhoisInternalService whoisInternalService;

    @Autowired
    public UnsubscribeController(final WhoisInternalService whoisInternalService) {
        this.whoisInternalService = whoisInternalService;
    }

    @RequestMapping(value = "/{messageId}", method = RequestMethod.GET)
    public String unsubscribeConfirm(@PathVariable final String messageId) {
        return "redirect:/unsubscribe-confirm/" + messageId;
    }

    @RequestMapping(value = "/{messageId}", method = RequestMethod.POST)
    public ResponseEntity unsubscribe(@PathVariable final String messageId) {
        whoisInternalService.unSubscribe(messageId);
        return new ResponseEntity(HttpStatus.OK);
    }
}
