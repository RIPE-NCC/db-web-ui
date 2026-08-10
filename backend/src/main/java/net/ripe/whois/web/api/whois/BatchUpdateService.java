package net.ripe.whois.web.api.whois;

import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.map.IMap;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import static net.ripe.whois.web.api.whois.BatchStatus.DONE;
import static net.ripe.whois.web.api.whois.BatchStatus.IDLE;
import static net.ripe.whois.web.api.whois.BatchStatus.WAITING_FOR_RESPONSE;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class BatchUpdateService {

    private static final Logger LOGGER = LoggerFactory.getLogger(BatchUpdateService.class);
    private static final String RESULTS_MAP = "batch-update-results";
    private static final String PENDING_MAP = "batch-update-pending"; // just a marker, cross-node visible

    // raw Future is never serialized — stays local to whichever node started the job
    private final Map<String, Future<ResponseEntity<String>>> localFutures = new ConcurrentHashMap<>();

    private final IMap<String, BatchUpdateResult> results;
    private final IMap<String, Boolean> pendingMarkers;

    public BatchUpdateService(final HazelcastInstance hazelcastInstance) {
        this.results = hazelcastInstance.getMap(RESULTS_MAP);
        this.pendingMarkers = hazelcastInstance.getMap(PENDING_MAP);
    }

    public BatchStatus getStatus(final String sessionId) {
        if (results.containsKey(sessionId)) {
            return DONE;
        }
        if (pendingMarkers.containsKey(sessionId)) {
            return WAITING_FOR_RESPONSE;
        }
        return IDLE;
    }

    public void setResponseFuture(final String sessionId, final Future<ResponseEntity<String>> responseFuture) {
        localFutures.put(sessionId, responseFuture);
        pendingMarkers.put(sessionId, Boolean.TRUE);

        CompletableFuture.runAsync(() -> resolve(sessionId, responseFuture));
    }

    private void resolve(final String sessionId, final Future<ResponseEntity<String>> responseFuture) {
        try {
            final ResponseEntity<String> responseEntity = responseFuture.get();
            if (responseEntity == null) {
                LOGGER.error("Response is null when getting status");
                results.put(sessionId, new BatchUpdateResult(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error processing your request"));
            } else {
                results.put(sessionId, new BatchUpdateResult(
                        responseEntity.getStatusCode().value(), responseEntity.getBody()));
            }
        } catch (InterruptedException | ExecutionException e) {
            LOGGER.error(e.getMessage(), e);
            results.put(sessionId, new BatchUpdateResult(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(), e.getMessage()));
        } finally {
            localFutures.remove(sessionId);
            pendingMarkers.remove(sessionId);
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
