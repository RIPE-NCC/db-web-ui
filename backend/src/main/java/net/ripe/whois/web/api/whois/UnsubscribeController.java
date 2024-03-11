package net.ripe.whois.web.api.whois;

import jakarta.servlet.http.HttpServletResponse;
import net.ripe.db.whois.common.rpsl.ObjectTemplate;
import net.ripe.db.whois.common.rpsl.ObjectType;
import net.ripe.db.whois.query.QueryFlag;
import net.ripe.whois.web.api.ApiController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

import static jakarta.ws.rs.core.HttpHeaders.CACHE_CONTROL;

@RestController
public class UnsubscribeController  {

    @RequestMapping(value = "/unsubscribe-confirm/{:messageId}", method = {RequestMethod.POST}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity unsubscribe(HttpServletResponse response) {
        return new ResponseEntity<>("Successfully unsubscribed", HttpStatus.OK);
    }
}
