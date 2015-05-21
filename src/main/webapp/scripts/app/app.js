'use strict';

angular.module('dbWebuiApp', ['ui.router'])
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
    })
    .state('modify', {
        url: '/whoisobject/modify/:objectType/:objectUid',
        templateUrl: 'scripts/app/modify.html',
        controller: 'ModifyController'
    });
});
