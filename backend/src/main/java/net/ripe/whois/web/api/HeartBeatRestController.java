package net.ripe.whois.web.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HeartBeatRestController extends ApiController {

    @GetMapping(path = "/api/heartbeat")
    public String getHealth() {
        return "TABOOM";
    }
}
