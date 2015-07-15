package net.ripe.whois.services.rest;

import org.springframework.http.HttpStatus;

public class RestUtil {

    public static boolean isError(final HttpStatus status) {
        final HttpStatus.Series series = status.series();
        return (HttpStatus.Series.CLIENT_ERROR.equals(series)
                || HttpStatus.Series.SERVER_ERROR.equals(series));
    }
}
