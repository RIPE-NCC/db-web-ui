'use strict';

angular.module('dbWebApp')
    .constant('Properties', {
        BUILD_TAG: '<%= grunt.build.tag %>',
        ENV: '<%= grunt.environment.ENV %>',
        SOURCE: '<%= grunt.environment.SOURCE %>',
        LOGIN_URL: '<%= grunt.environment.LOGIN_URL %>',
        PORTAL_URL: '<%= grunt.environment.PORTAL_URL %>'
    });
