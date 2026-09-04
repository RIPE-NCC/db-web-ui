package net.ripe.whois.config;

public final class OidcUtils {

    private OidcUtils() {}

    public static final int HAZELCAST_OIDC_CACHES_TIMEOUT = 8 * 60;

    public static final String OIDC_LOCAL_COOKIE_NAME = "DBSESSIONID";

    public static final String OIDC_CSRF_COOKIE_NAME = "DBCSRFTOKEN";

    public static final String IDP_AUTHORISATION_ENDPOINT = "/oauth2/authorization";

    public static final String REGISTRATION_ID = "keycloak";

    public static final String IDP_AUTHORISATION_ENDPOINT_REGISTRATION_ID = "/db-web-ui/oauth2/authorization/keycloak";

}
