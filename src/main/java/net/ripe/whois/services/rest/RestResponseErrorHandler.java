package net.ripe.whois.services.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResponseErrorHandler;

import java.io.IOException;

public class RestResponseErrorHandler implements ResponseErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(RestResponseErrorHandler.class);

    @Override
    public void handleError(ClientHttpResponse response) throws IOException {
        LOGGER.error("Response error: {} {}", response.getStatusCode(), response.getStatusText());
        throw new HttpClientErrorException(response.getStatusCode(), response.getStatusText());
    }

    @Override
    public boolean hasError(ClientHttpResponse response) throws IOException {
        return RestUtil.isError(response.getStatusCode());
    }
}
