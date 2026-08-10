package net.ripe.whois.web.api.whois;

import java.io.Serial;
import java.io.Serializable;

public record BatchUpdateResult(int statusCode, String body) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
}
