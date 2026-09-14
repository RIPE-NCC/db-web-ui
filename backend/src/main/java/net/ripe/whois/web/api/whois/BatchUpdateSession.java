package net.ripe.whois.web.api.whois;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static net.ripe.whois.web.api.whois.BatchStatus.DONE;
import static net.ripe.whois.web.api.whois.BatchStatus.IDLE;

@Component
public class BatchUpdateSession {

    private static final Logger LOGGER = LoggerFactory.getLogger(BatchUpdateSession.class);
    private static final String RESULTS_MAP = "batch-update-results";

    // raw Future is never serialized — stays local to whichever node started the job
    private final Map<String, Future<ResponseEntity<String>>> localFutures = new ConcurrentHashMap<>();

    private final IMap<String, BatchUpdateResult> results;

    public BatchUpdateSession(final HazelcastInstance hazelcastInstance) {
        this.results = hazelcastInstance.getMap(RESULTS_MAP);
    }

    public BatchStatus getStatus(final String sessionId) {
        final BatchUpdateResult result = results.get(sessionId);
        return result == null ? IDLE : result.status();
    }

    public void setResponseFuture(final String sessionId, final Future<ResponseEntity<String>> responseFuture) {
        localFutures.put(sessionId, responseFuture);
        results.put(sessionId, BatchUpdateResult.pending());

        CompletableFuture.runAsync(() -> resolve(sessionId, responseFuture));
    }

    private void resolve(final String sessionId, final Future<ResponseEntity<String>> responseFuture) {
        try {
            final ResponseEntity<String> responseEntity = responseFuture.get();
            if (responseEntity == null) {
                LOGGER.error("Response is null when getting status");
                results.put(sessionId, BatchUpdateResult.done(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error processing your request"));
            } else {
                results.put(sessionId, BatchUpdateResult.done(
                        responseEntity.getStatusCode().value(), responseEntity.getBody()));
            }
        } catch (InterruptedException | ExecutionException e) {
            LOGGER.error(e.getMessage(), e);
            results.put(sessionId, BatchUpdateResult.done(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(), e.getMessage()));
            Thread.currentThread().interrupt();
        } finally {
            localFutures.remove(sessionId);
        }
    }

    public ResponseEntity<String> getResponse(final String sessionId) {
        if (getStatus(sessionId) != DONE) {
            throw new IllegalStateException("This should not happen, something went wrong");
        }

        final BatchUpdateResult result = results.remove(sessionId); // one-shot, same as original behaviour
        return new ResponseEntity<>(result.body(), HttpStatus.valueOf(result.statusCode()));
    }
}
