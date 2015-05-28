package net.ripe.whois.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * REST controller for managing users.
 */
@RestController
@RequestMapping("/api/")
public class NewResource {

    private final Logger log = LoggerFactory.getLogger(NewResource.class);

    @RequestMapping(value = "/**")
    public String someName(@RequestBody String body, HttpServletRequest request) {
        return body;
    }

}
