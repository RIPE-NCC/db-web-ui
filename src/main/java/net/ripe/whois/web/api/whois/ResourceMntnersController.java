package net.ripe.whois.web.api.whois;

import net.ripe.db.whois.api.rest.client.RestClient;
import net.ripe.whois.services.ResourceMntnersService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.net.URLDecoder;

@RestController
@RequestMapping("/api/resource")
public class ResourceMntnersController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ResourceMntnersController.class);

    @Autowired
    private ResourceMntnersService service;

    @Value("${ripe.search.queryUrl}")
    private String queryUrl;


    @Autowired
    RestClient restclient;

    @RequestMapping(value = "/{source}/{objectType}/{name:.*}/mntners", method = RequestMethod.GET)
    public ResponseEntity<String> getMNtners(@PathVariable String source, @PathVariable String resourceType, @PathVariable String resourceName)
        throws URISyntaxException, UnsupportedEncodingException {

        final String decodedName = URLDecoder.decode(resourceName, "UTF-8");
        LOGGER.debug("search parent mntners of {} {} {}->{}", source, resourceType, resourceName, decodedName);

        return service.getMntnersForResource(source, resourceType, decodedName);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleAllExceptions() {
        // Nothing to do
    }
}
