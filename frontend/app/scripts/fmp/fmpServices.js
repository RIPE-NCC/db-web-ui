/*global angular*/

(function () {
    'use strict';

angular.module('fmp')
    .factory('EmailLink', function ($resource) {
        return $resource('api/whois-internal/api/fmp-pub/emaillink/:hash.json', {hash: '@hash'}, {
            'update': {method: 'PUT'}
        });
    });
})();
