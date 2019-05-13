// this config is for local testing only. deployments will serve a parsed version of this file from the backend
angular.module("dbWebApp")
    .constant("Properties", {
        ENV: "LOCALHOST",
        SOURCE: "RIPE",
        BUILD_TAG: "SNAPSHOT",
        LOGIN_URL: "https://access.prepdev.ripe.net/",
        ACCESS_URL: "https://access.prepdev.ripe.net?originalUrl=https://dev.db.ripe.net/db-web-ui/",
        LOGOUT_URL: "https://access.prepdev.ripe.net/logout?originalUrl=https://localhost.ripe.net:8443/db-web-ui/#query",
        PORTAL_URL: "https://my.prepdev.ripe.net/",
        BANNER: "Welcome to the DEV Environment of the RIPE Database.",
    });
