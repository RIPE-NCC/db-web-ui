package net.ripe.whois.web.api;

import org.springframework.http.HttpHeaders;

public class ApiController {

    protected void removeUnnecessaryHeaders(final HttpHeaders headers) {
        // The address used for this header was the one used on the browser.
        // This problem was caused by the need to bypass all the request to the proxy,
        // but it was not able to resolve it and the response was HTTP-400.
        headers.remove(HttpHeaders.HOST);
    }

}
