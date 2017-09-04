// this config is for local testing only. deployments will serve a parsed version of this file from the backend
'use strict';

angular.module('dbWebApp')
    .constant('Properties', {
        ENV: 'LOCALHOST',
        SOURCE: 'RIPE',
        BUILD_TAG: 'SNAPSHOT',
        LOGIN_URL: 'https://access.prepdev.ripe.net/',
        ACCESS_URL: 'https://access.prepdev.ripe.net?originalUrl=https://dev.db.ripe.net/db-web-ui/',
        PORTAL_URL: 'https://my.prepdev.ripe.net/',
        BANNER: 'Welcome to the DEV Environment of the RIPE Database.',
        GTM_ID: 'GTM-WTWTB7',
        LIVE_CHAT_KEY: '98e82f81b368ddac660f7980f60227954738de3d5b6eaf8d07fc763f617d80b5',
        OBJECT_LOOKUP_URL: '/search/lookup.html', // feature switch
        MY_RESOURCES_URL: '#/myresources/overview'
    });

