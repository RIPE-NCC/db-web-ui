'use strict';

angular.module('interceptors')
.constant('ERROR_EVENTS', {
    serverError: 'server-error-occurred',
    notFound: 'not-found',
    authenticationError:'authentication-error',
    stateTransitionError:'$stateChangeError'
})
.factory('ErrorInterceptor', function ($rootScope, $q, $location, $log, ERROR_EVENTS) {

        function _isAuthorisationError( status ) {
            return status === 401 || status === 403;
        }

        function _mustErrorBeSwallowed( response ) {
            var toBeSwallowed = false;

            $log.debug('http-status:' +  response.status  + ' ui-url:' + $location.path());
            if(!_.isUndefined( response.config)) {
                $log.debug('rest-url:' + response.config.url);
            }

            if( _isAuthorisationError(response.status) && _.endsWith(response.config.url, 'api/user/info')) {
                toBeSwallowed = true;
            }

            if( response.status === 404 && _.startsWith( $location.path(), '/textupdates/multi/')) {
                toBeSwallowed = true;
            }

            $log.debug('Must be swallowed? ' + toBeSwallowed);

            return toBeSwallowed;
        }

    return {
        responseError: function (response) {
            $log.info('resp:' + JSON.stringify(response));
            if( !_mustErrorBeSwallowed(response) ) {
                $rootScope.$broadcast({
                    500: ERROR_EVENTS.serverError,
                    502: ERROR_EVENTS.serverError,
                    503: ERROR_EVENTS.serverError,
                    404: ERROR_EVENTS.notFound,
                    401: ERROR_EVENTS.authenticationError,
                    403: ERROR_EVENTS.authenticationError
                }[response.status], response);
            }

            return $q.reject(response);
        }
    };
})
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('ErrorInterceptor');
});
