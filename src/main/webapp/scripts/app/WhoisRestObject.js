'use strict';

angular.module('dbWebApp').factory('WhoisRestObject', ['$resource', function($resource) {
    return $resource('whois/:source/:objectType/:objectUid', {source: source, objectType: objectType, objectUid:objectUid}, {
            update: {
                method: 'PUT',
                isArray: false
            }
     });
}]);
