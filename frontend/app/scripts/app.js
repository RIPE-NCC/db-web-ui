'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'angular-loading-bar',
    'ngAnimate',
    'ngResource',
    'ngSanitize',
    'angulartics',
    'angulartics.google.tagmanager',
    'diff-match-patch',
    'ui.bootstrap',
    'ui.select',
    'ngCookies',
    'updates',
    'webUpdates',
    'textUpdates',
    'fmp',
    'loginStatus'
])

    .config(['$stateProvider', '$logProvider', '$httpProvider', 'Properties',
        function ($stateProvider, $logProvider, $httpProvider, Properties) {

            // conditional log-level
            $logProvider.debugEnabled(['local', 'dev', 'prepdev'].indexOf(Properties.ENV) > -1);
            $stateProvider
                .state('error', {
                    url: '/public/error',
                    templateUrl: 'scripts/views/error.html'
                })
                .state('notFound', {
                    url: '/public/not-found',
                    templateUrl: 'scripts/views/notFound.html'
                });

            // Always tell server if request was made using ajax
            $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        }])
    .run(['$rootScope', '$state', '$window', '$location', '$log', 'ERROR_EVENTS', 'Properties',
        function ($rootScope, $state, $window, $location, $log, ERROR_EVENTS, Properties) {

            var destroyable = {}; // Hold listeners in this var so they get destroyed by ng

            destroyable.one = $rootScope.$on(ERROR_EVENTS.stateTransitionError, function (event, toState, toParams, fromState, fromParams, err) {
                $log.error('Error transitioning to state:' + angular.toJson(toState) + ' due to error ' + angular.toJson(err));

                if (err.status === 403 || err.status === 401) {
                    // redirect to crowd login screen
                    var returnUrl = $location.absUrl().split('#')[0] + $state.href(toState, toParams);
                    redirectToLogin(returnUrl);
                }
            });

            destroyable.two = $rootScope.$on(ERROR_EVENTS.serverError, function () {
                $state.go('error');
            });

            destroyable.three = $rootScope.$on(ERROR_EVENTS.notFound, function () {
                $state.go('notFound');
            });

            destroyable.four = $rootScope.$on(ERROR_EVENTS.authenticationError, function () {
                //TODO do not act; authorisation errors during transition should be handled by stateTransitionError-handler above
                $log.error('Authentication error');
                var url = $location.absUrl();
                if (url.indexOf('myresources') > -1) {
                    redirectToLogin(url);
                }
            });

            function redirectToLogin(url) {
                var crowdUrl = Properties.LOGIN_URL + '?originalUrl=' + encodeURIComponent(url);
                $log.info('Force crowd login:' + crowdUrl);
                $window.location.href = crowdUrl;
            }

        }])
    .controller('PageController', ['Properties', 'Labels', function (Properties, Labels) {
        var vm = this;
        vm.Properties = Properties;
        vm.labels = Labels;
    }]);
