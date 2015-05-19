'use strict';

angular.module('whoisWebuiApp')
    .factory('Register', function ($resource) {
        return $resource('api/register', {}, {
        });
    });


