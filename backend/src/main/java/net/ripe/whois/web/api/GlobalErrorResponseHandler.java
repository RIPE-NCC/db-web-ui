package net.ripe.whois.web.api;

import jakarta.ws.rs.BadRequestException;
import net.ripe.db.whois.api.rest.client.RestClientException;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@ControllerAdvice
@SuppressWarnings("UnusedDeclaration")
public class GlobalErrorResponseHandler extends ResponseEntityExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalErrorResponseHandler.class);

    @ExceptionHandler(RestClientException.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, RestClientException rex) {
        LOGGER.debug("Global error handler got RestClientException", rex);
        final String message = StringUtils.join(rex.getErrorMessages(), '\n');
        return new ResponseEntity<>(message, HttpStatus.valueOf(rex.getStatus()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, IllegalArgumentException ex) {
        LOGGER.debug("Global error handler got IllegalArgumentException", ex);
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IOException.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, IOException ex) {
        LOGGER.debug("Global error handler got IOException", ex);
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpClientErrorException.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, HttpClientErrorException ex) {
        LOGGER.debug("Global error handler got HttpClientErrorException", ex);
        return new ResponseEntity<>(ex.getMessage(), ex.getStatusCode());
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, Exception ex) {
        if (ex instanceof BadRequestException) {
            LOGGER.info("Global error handler got {}: {}", ex.getClass().getName(), ex.getMessage());
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
        LOGGER.error("Global error handler got Exception", ex);
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
