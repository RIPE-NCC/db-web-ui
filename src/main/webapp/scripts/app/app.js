'use strict';

angular.module('dbWebuiApp', ['ui.router', 'ngResource'])
.config(function ($stateProvider, $urlRouterProvider) {
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
});
