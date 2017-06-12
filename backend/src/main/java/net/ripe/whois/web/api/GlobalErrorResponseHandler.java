package net.ripe.whois.web.api;

import net.ripe.db.whois.api.rest.client.RestClientException;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import javax.servlet.http.HttpServletRequest;

@ControllerAdvice
@SuppressWarnings("UnusedDeclaration")
public class GlobalErrorResponseHandler extends ResponseEntityExceptionHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalErrorResponseHandler.class);

    @ExceptionHandler(RestClientException.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, RestClientException rex) {
        LOGGER.debug("Global error handler got RestClientException: {} ", rex.getMessage());
        final String message = StringUtils.join(rex.getErrorMessages(), '\n');
        return new ResponseEntity<>(message, HttpStatus.valueOf(rex.getStatus()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, IllegalArgumentException ex) {
        LOGGER.debug("Global error handler got IllegalArgumentException: {} ", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ResponseEntity<Object> handleControllerException(HttpServletRequest req, Exception ex) {
        LOGGER.error("Global error handler got general Exception: {} ", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
