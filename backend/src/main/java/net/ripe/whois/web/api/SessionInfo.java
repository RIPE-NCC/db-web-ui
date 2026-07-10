package net.ripe.whois.web.api;

import java.time.Instant;

public record SessionInfo(
    boolean authenticated,
    Instant expiresAt
) {}
