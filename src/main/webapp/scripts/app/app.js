'use strict';

angular.module('dbWebuiApp', ['ui.router'])
.config(function ($stateProvider) {

    $stateProvider
    .state('main', {
        url: '/',
        abstract: true,
        controller: ['$scope', '$state',
            function( $scope, $state) {
                $state.go('select');
            }]
    })
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
    })
    .state('display', {
        url: '/whoisobject/display/:objectType/:objectUid',
        templateUrl: 'scripts/app/display.html',
        controller: 'DisplayController'
    });
});
