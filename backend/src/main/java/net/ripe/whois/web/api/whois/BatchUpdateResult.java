package net.ripe.whois.web.api.whois;

import java.io.Serializable;

public record BatchUpdateResult(BatchStatus status, Integer statusCode, String body) implements Serializable {
    public static BatchUpdateResult pending() {
        return new BatchUpdateResult(BatchStatus.WAITING_FOR_RESPONSE, null, null);
    }

    public static BatchUpdateResult done(int statusCode, String body) {
        return new BatchUpdateResult(BatchStatus.DONE, statusCode, body);
    }
}
