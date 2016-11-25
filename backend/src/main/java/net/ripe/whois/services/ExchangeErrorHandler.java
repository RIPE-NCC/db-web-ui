package net.ripe.whois.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;

public class ExchangeErrorHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(ExchangeErrorHandler.class);

    ResponseEntity execute(ExchangeCall exchangeCall) {
        return execute(exchangeCall, (HttpClientErrorException e) -> new ResponseEntity(e.getResponseBodyAsString(), e.getStatusCode()));
    }

    ResponseEntity execute(ExchangeCall exchangeCall, ErrorHandler errorHandler) {
        try {
            return exchangeCall.call();
        } catch (HttpClientErrorException e) {
            return errorHandler.handle(e);
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
            throw e;
        }
    }

}

interface ExchangeCall {
    ResponseEntity call() throws HttpClientErrorException;
}

interface ErrorHandler {
    ResponseEntity handle(HttpClientErrorException e) throws HttpClientErrorException;
}
