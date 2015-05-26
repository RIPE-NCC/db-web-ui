'use strict';

angular.module('dbWebuiApp', ['ui.router'])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/whoisobject/select');

    $stateProvider
    .state('select', {
        url: '/whoisobject/select',
        templateUrl: 'scripts/app/select.html',
        controller: 'SelectController'
    })
    .state('create', {
        url: '/whoisobject/create/:objectType/:source',
        templateUrl: 'scripts/app/create.html',
        controller: 'CreateController'
    });

	$locationProvider.html5Mode({
         enabled: true,
         requireBase: false
	});

});
