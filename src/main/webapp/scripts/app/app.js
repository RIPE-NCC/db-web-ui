'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'angular-md5',
    'ngResource',
    'webUpdates',
    'interceptors'])
.config(function ($stateProvider) {
    $stateProvider
        .state('error', {
            url: '/public/error',
            templateUrl: 'scripts/app/views/error.html'
        });
})
.run(function ($rootScope, $state, ERROR_EVENTS) {
    $rootScope.$on(ERROR_EVENTS.serverError, function () {
        $state.go('error');
    });
});
