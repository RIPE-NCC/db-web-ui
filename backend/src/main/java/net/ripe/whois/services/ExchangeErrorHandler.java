package net.ripe.whois.services;

import org.slf4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpStatusCodeException;

public interface ExchangeErrorHandler {

    default ResponseEntity<String> handleErrors(ExchangeCall exchangeCall, Logger logger) {
        return handleErrors(exchangeCall, (HttpStatusCodeException e) -> new ResponseEntity<>(e.getResponseBodyAsString(), e.getStatusCode()), logger);
    }

    default ResponseEntity<String> handleErrors(ExchangeCall exchangeCall, ErrorHandler errorHandler, Logger logger) {
        try {
            return exchangeCall.call();
        } catch (HttpStatusCodeException  e) {
            return errorHandler.handle(e);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            throw e;
        }
    }
}

@FunctionalInterface
interface ExchangeCall {
    ResponseEntity<String> call() throws HttpStatusCodeException;
}

@FunctionalInterface
interface ErrorHandler {
    ResponseEntity<String> handle(HttpStatusCodeException e);
}
