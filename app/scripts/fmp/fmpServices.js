/*global angular*/

(function () {
    'use strict';

    angular.module('fmp')
        .factory('UserInfo', function ($resource) {
            return $resource('api/user/info', {});
        })
        .factory('Maintainer', function ($resource) {
            return $resource('api/whois-internal/api/fmp-pub/mntner/:maintainerKey', {});
        })
        .factory('Validate', function ($resource) {
            return $resource('api/whois-internal/api/fmp-pub/mntner/:maintainerKey/validate', {});
        })
        .factory('SendMail', function ($resource) {
            return $resource('api/whois-internal/api/fmp-pub/mntner/:maintainerKey/emaillink.json', {maintainerKey: '@maintainerKey'});
        })
        .factory('EmailLink', function ($resource) {
            return $resource('api/whois-internal/api/fmp-pub/emaillink/:hash.json', {hash: '@hash'}, {
                'update': {method: 'PUT'}
            });
        });

})();
