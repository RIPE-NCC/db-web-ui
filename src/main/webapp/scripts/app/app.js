'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'angular-loading-bar',
    'ngResource',
    'ngSanitize',
    'interceptors',
    'angulartics',
    'angulartics.google.tagmanager',
    'diff-match-patch',
    'ui.bootstrap',
    'ui.select',
    'webUpdates',
    'textUpdates',
    'fmp',
    'ngCookies',
])

    .config(['$stateProvider', '$logProvider', '$httpProvider', 'ENV',
        function ($stateProvider, $logProvider, $httpProvider, ENV) {

            // conditional log-level
            if (ENV === "dev" || ENV == 'prepdev') {
                $logProvider.debugEnabled(true);
            } else {
                // disable debug logging for production
                $logProvider.debugEnabled(false);
            }

            $stateProvider
                .state('error', {
                    url: '/public/error',
                    templateUrl: 'scripts/app/views/error.html'
                })
                .state('notFound', {
                    url: '/public/not-found',
                    templateUrl: 'scripts/app/views/notFound.html'
                });

            // Always tell server if request was made using ajax
            $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

        }])
    .run(['$rootScope', '$state', '$window', '$location', '$log', '$cookies', 'ERROR_EVENTS', 'LOGIN_URL', 'ENV',
        function ($rootScope, $state, $window, $location, $log, $cookies, ERROR_EVENTS, LOGIN_URL, ENV) {

            $log.info('Starting up for env ' + ENV);

            $rootScope.$on(ERROR_EVENTS.stateTransitionError, function (event, toState, toParams, fromState, fromParams, err) {
                $log.error('Error transitioning to state:' + JSON.stringify(toState) + ' due to error ' + JSON.stringify(err));

                if (err.status === 403) {
                    // redirect to crowd login screen
                    var returnUrl = $location.absUrl().split('#')[0] + $state.href(toState, toParams);
                    var crowdUrl = LOGIN_URL + '?originalUrl=' + encodeURIComponent(returnUrl);
                    $log.info('Force crowd login:' + crowdUrl);
                    $window.location.href = crowdUrl;
                }
            });

            $rootScope.$on(ERROR_EVENTS.serverError, function () {
                $state.go('error');
            });

            $rootScope.$on(ERROR_EVENTS.notFound, function () {
                $state.go('notFound');
            });

            $rootScope.$on(ERROR_EVENTS.authenticationError, function () {
                // do not act; authorisation errors during transition are handled by stateTransitionError-handler above
                $log.error('Authentication error');
            });

        }]);
