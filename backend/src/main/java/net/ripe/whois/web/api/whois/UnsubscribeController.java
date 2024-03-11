package net.ripe.whois.web.api.whois;

import net.ripe.whois.web.api.ApiController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping("/api/unsubscribe")
public class UnsubscribeController extends ApiController {

    @RequestMapping(value = "/{messageId}", method = RequestMethod.POST)
    public String unsubscribe(@PathVariable final String messageId) {
        return "redirect:/unsubscribe/" + messageId;
    }

    @RequestMapping(value = "/{messageId}", method = RequestMethod.GET)
    public String unsubscribeConfirm(@PathVariable final String messageId) {
        return "redirect:/unsubscribe-confirm/" + messageId;
    }

}
