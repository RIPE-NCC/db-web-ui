package net.ripe.whois.web.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.BadRequestException;
import net.ripe.db.whois.api.rest.client.RestClientException;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.io.IOException;

@ControllerAdvice
@SuppressWarnings("UnusedDeclaration")
public class GlobalErrorResponseHandler extends ResponseEntityExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalErrorResponseHandler.class);

    @ExceptionHandler(RestClientException.class)
    @ResponseBody
    public ResponseEntity<Object> restClientException(HttpServletRequest req, RestClientException rex) {
        LOGGER.debug("RestClientException", rex);
        final String message = StringUtils.join(rex.getErrorMessages(), '\n');
        return new ResponseEntity<>(message, HttpStatus.valueOf(rex.getStatus()));
    }

    @ExceptionHandler(HttpClientErrorException.class)
    @ResponseBody
    public ResponseEntity<Object> httpClientError(HttpServletRequest req, HttpClientErrorException ex) {
        LOGGER.debug("HttpClientErrorException", ex);
        return new ResponseEntity<>(ex.getMessage(), ex.getStatusCode());
    }

    @ExceptionHandler({BadRequestException.class, RequestRejectedException.class, IOException.class, IllegalArgumentException.class})
    public ResponseEntity<Object> badRequest(HttpServletRequest req, Exception ex) {
        LOGGER.debug("Returning Bad Request for {}: {}", ex.getClass().getName(), ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<Object> internalServerError(HttpServletRequest req, Exception ex) {
        LOGGER.error("Returning Internal Server Error", ex);
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
