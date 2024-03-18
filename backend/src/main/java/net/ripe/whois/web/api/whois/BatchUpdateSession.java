package net.ripe.whois.web.api.whois;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static net.ripe.whois.web.api.whois.BatchStatus.DONE;
import static net.ripe.whois.web.api.whois.BatchStatus.IDLE;
import static net.ripe.whois.web.api.whois.BatchStatus.WAITING_FOR_RESPONSE;

@Component
@Scope(proxyMode=ScopedProxyMode.TARGET_CLASS, value="session")
class BatchUpdateSession {
    private static final Logger LOGGER = LoggerFactory.getLogger(BatchUpdateSession.class);

    private Future<ResponseEntity<String>> response = null;

    public BatchStatus getStatus() {

        if (response == null || response.isCancelled())
            return IDLE;
        else if (!response.isDone())
            return WAITING_FOR_RESPONSE;
        else
            return DONE;
    }

    void setResponseFuture(Future<ResponseEntity<String>> responseFuture) {
        this.response = responseFuture;
    }

    public ResponseEntity getResponse() {
        if (getStatus() != DONE){
            throw new IllegalStateException("This should not happen, something went wrong");
        }

        try {
            final ResponseEntity responseEntity = response != null ? response.get() : null;
            if (responseEntity == null){
                LOGGER.error("Response is null when getting status");
                return new ResponseEntity<>("Error processing your request", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return responseEntity;
        } catch (InterruptedException | ExecutionException e) {
            LOGGER.error(e.getMessage(), e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            response = null;
        }
    }
}
