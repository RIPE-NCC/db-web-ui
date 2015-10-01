'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'ngResource',
    'ngSanitize',
    'webUpdates',
    'interceptors',
    'angulartics',
    'angulartics.google.tagmanager',
    'diff-match-patch',
    'ui.bootstrap',
    'ui.select'])
.config(function ($stateProvider, $analyticsProvider) {
        $stateProvider
        .state('error', {
            url: '/public/error',
            templateUrl: 'scripts/app/views/error.html'
        })
        .state('notFound', {
            url: '/public/not-found',
            templateUrl: 'scripts/app/views/notFound.html'
        });

        //$analyticsProvider.developerMode(true);
        //$analyticsProvider.firstPageview(true);

    })
.run(function ($rootScope, $state, $window, $location, $log, ERROR_EVENTS, LOGIN_URL) {

    $rootScope.$on(ERROR_EVENTS.serverError, function () {
        $state.go('error');
    });

    $rootScope.$on(ERROR_EVENTS.notFound, function () {
        $state.go('notFound');
    });

    $rootScope.$on(ERROR_EVENTS.authenticationError, function () {
        $window.location.href = LOGIN_URL + '?originalUrl=' + $location.absUrl();
    });
});
