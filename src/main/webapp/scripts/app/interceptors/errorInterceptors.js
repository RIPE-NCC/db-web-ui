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
            var toBeSwallowed = _isAuthorisationError(response.status) && _.endsWith(response.config.url, 'api/user/info');

            $log.info('Must error ' + response.status + ' for ' + response.config.url + ' be swallowed? ' + toBeSwallowed);

            return toBeSwallowed;
        }

    return {
        responseError: function (response) {
            $log.info('resp:' + JSON.stringify(response));
            if( !_mustErrorBeSwallowed(response) ) {
                $rootScope.$broadcast({
                    500: ERROR_EVENTS.serverError,
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
