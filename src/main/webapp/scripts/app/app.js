'use strict';

angular.module('dbWebApp', [
    'ui.router',
    'ngResource',
    'webUpdates',
    'interceptors',
    'angulartics',
    'angulartics.google.tagmanager'])
.config(function ($stateProvider, $locationProvider) {
	//$locationProvider.html5Mode(true);
	
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