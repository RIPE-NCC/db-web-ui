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
.config(function ($stateProvider) {
    $stateProvider
        .state('error', {
            url: '/public/error',
            templateUrl: 'scripts/app/views/error.html'
        })
        .state('notFound', {
            url: '/public/not-found',
            templateUrl: 'scripts/app/views/notFound.html'
        });
})
.run(function ($rootScope, $state, ERROR_EVENTS) {
    $rootScope.$on(ERROR_EVENTS.serverError, function () {
        $state.go('error');
    });

    $rootScope.$on(ERROR_EVENTS.notFound, function () {
        $state.go('notFound');
    });

});
