'use strict';

angular.module('dbWebApp')
    .constant('ENV', '<%= grunt.environment.ENV %>')
    .constant('SOURCE', 'RIPE')
    .constant('VERSION', '0.2.1-SNAPSHOT')
    .constant('LOGIN_URL', '<%= grunt.environment.LOGIN_URL %>')
    .constant('PORTAL_URL', '<%= grunt.environment.PORTAL_URL %>')
;
