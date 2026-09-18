package net.ripe.whois.config;

import jakarta.servlet.http.HttpServletRequest;

import javax.annotation.Nullable;

public final class OidcUtils {

    private OidcUtils() {}

    public static final String HTTP_SESSION_CACHE = "spring:session:sessions";

    public static final String OIDC_LOCAL_COOKIE_NAME = "DBSESSIONID";

    public static final String OIDC_CSRF_COOKIE_NAME = "DBCSRFTOKEN";

    public static final String IDP_AUTHORISATION_ENDPOINT = "/oauth2/authorization";

    public static final String REGISTRATION_ID = "keycloak";

    public static final String IDP_AUTHORISATION_ENDPOINT_REGISTRATION_ID = "/db-web-ui/oauth2/authorization/keycloak";

    @Nullable
    public static String extractRegistrationId(HttpServletRequest request) {
        final String uri = request.getRequestURI();
        final String prefix = IDP_AUTHORISATION_ENDPOINT + "/";
        final int index = uri.indexOf(prefix);
        if (index == -1) {
            return null;
        }
        return uri.substring(index + prefix.length());
    }
}
