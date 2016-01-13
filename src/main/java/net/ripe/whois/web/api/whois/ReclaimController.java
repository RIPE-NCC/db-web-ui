package net.ripe.whois.web.api.whois;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import net.ripe.db.whois.api.rest.client.RestClientUtils;
import net.ripe.whois.services.ReclaimService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reclaim")
public class ReclaimController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ReclaimController.class);
    private String whoisApiUrl;

    @Autowired
    public ReclaimController(@Value("${rest.api.ripeUrl}") final String whoisApiUrl ) {
        this.whoisApiUrl = whoisApiUrl;
    }

    @RequestMapping(value = "/{source}/{objectType}/{objectName:.*}", method = RequestMethod.GET)
    public ResponseEntity getMntnerThatCanAuthenticate(@PathVariable String source, @PathVariable String objectType, @PathVariable String objectName)
        throws URISyntaxException, UnsupportedEncodingException {

        ReclaimService service = new ReclaimService(RestClientUtils.createRestClient(whoisApiUrl, source).request());

        final String decodedName = URLDecoder.decode(objectName, "UTF-8");
        List<Map<String,Object>> authenticationCandidates = service.getMntnersToReclaim(source, objectType, decodedName);

        final MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        return new ResponseEntity<>(authenticationCandidates, headers, HttpStatus.OK);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public void handleAllExceptions() {
        // Nothing to do
    }


}
