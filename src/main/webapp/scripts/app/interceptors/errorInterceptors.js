'use strict';

angular.module('interceptors')
.constant('ERROR_EVENTS', {
    serverError: 'server-error-occurred'
})
.factory('ErrorInterceptor', function ($rootScope, $q, ERROR_EVENTS) {
    return {
        responseError: function (response) {
            $rootScope.$broadcast({
                500: ERROR_EVENTS.serverError
            }[response.status], response);

            return $q.reject(response);
        }
    };
})
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('ErrorInterceptor');
});
