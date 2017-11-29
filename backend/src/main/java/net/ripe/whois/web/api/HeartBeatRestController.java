package net.ripe.whois.web.api;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HeartBeatRestController extends ApiController {

    @RequestMapping(value = "/api/heartbeat")
    public String getHealth() throws Exception {
        return "TABOOM";
    }
}
