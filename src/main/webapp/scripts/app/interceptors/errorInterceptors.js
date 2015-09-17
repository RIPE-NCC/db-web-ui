'use strict';

angular.module('interceptors')
.constant('ERROR_EVENTS', {
    serverError: 'server-error-occurred',
    notFound: 'not-found',
    authenticationError:'authentication-error'
})
.factory('ErrorInterceptor', function ($rootScope, $location, $q, $log, ERROR_EVENTS) {
        function mustErrorBePropagated( httpStatus ) {
            var status = true;

            if( httpStatus === 401 || httpStatus === 403 ) {
                var unProtectedPages = [
                    '/',
                    '/webupdates/display/.*',
                    '/webupdates/select'
                ];
                if (_.some(unProtectedPages, function (item) {
                            return new RegExp(item).test($location.url());
                        }
                    )) {
                    $log.info('Swallow authentication error while on page ' + $location.url());
                    status = false;
                }
            }

            return status;
        }
    return {
        responseError: function (response) {
            if( mustErrorBePropagated(response.status) ) {
                $log.info('Propagate error of type ' + response.status);

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
