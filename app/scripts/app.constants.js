'use strict';

angular.module('dbWebApp')
    .constant('Properties', {
        ENV: '<%= grunt.environment.ENV %>',
        SOURCE: 'RIPE',
        BUILD_TAG: '<%= grunt.build.tag %>',
        LOGIN_URL: '<%= grunt.environment.LOGIN_URL %>',
        PORTAL_URL: '<%= grunt.environment.PORTAL_URL %>'
    });
