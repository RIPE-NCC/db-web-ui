'use strict';

angular.module('dbWebApp')
    .constant('ERROR_EVENTS', {
        serverError: 'server-error-occurred',
        notFound: 'not-found',
        authenticationError: 'authentication-error',
        stateTransitionError: '$stateChangeError'
    })
    .factory('ErrorInterceptor', function ($rootScope, $q, $location, $log, ERROR_EVENTS) {

        function _isServerError(status) {
            return status === 500;
        }

        function _isAuthorisationError(status) {
            return status === 401 || status === 403;
        }

        function _isNotFoundError(status) {
            return status === 404;
        }


        function _mustErrorBeSwallowed(response) {
            var toBeSwallowed = false;

            $log.debug('ui-url:' + $location.path());
            $log.debug('http-status:' + response.status);

            if (!_.isUndefined(response.config)) {
                $log.debug('rest-url:' + response.config.url);
                if (_isAuthorisationError(response.status) && _.endsWith(response.config.url, 'api/user/info')) {
                    toBeSwallowed = true;
                }
                if (_isNotFoundError(response.status) && _.startsWith(response.config.url, 'api/whois-internal/')) {
                    toBeSwallowed = true;
                }
                //TODO - We can remove the following code after WhoIs 1.86 deployment
                // Code added to prevent 500 exploding to the user during autocomplete.
                // The real way to fix it is in Whois, but we're waiting it to be deployed.
                if (_isServerError(response.status) && _.startsWith(response.config.url, 'api/whois/autocomplete')) {
                    toBeSwallowed = true;
                }
            }

            if (_isNotFoundError(response.status) && _.startsWith($location.path(), '/textupdates/multi/')) {
                toBeSwallowed = true;
            }

            $log.debug('Must be swallowed? ' + toBeSwallowed);

            return toBeSwallowed;
        }

        return {
            responseError: function (response) {
                $log.info('resp:' + JSON.stringify(response));
                if (!_mustErrorBeSwallowed(response)) {
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
