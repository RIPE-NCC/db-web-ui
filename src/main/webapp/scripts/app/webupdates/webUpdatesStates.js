    'use strict';

angular.module('webUpdates')
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('webupdates/select');

        $stateProvider
            .state('select', {
                url: '/webupdates/select',
                templateUrl: 'scripts/app/webupdates/select.html',
                controller: 'SelectController'
            })
            .state('create', {
                url: '/webupdates/create/:source/:objectType',
                templateUrl: 'scripts/app/webupdates/create.html',
                controller: 'CreateController'
            })
            .state('modify', {
                url: '/webupdates/modify/:source/:objectType/:name',
                templateUrl: 'scripts/app/webupdates/create.html',
                controller: 'CreateController'
            })
            .state('display', {
                url: '/webupdates/display/:source/:objectType/:name',
                templateUrl: 'scripts/app/webupdates/display.html',
                controller: 'DisplayController'
            });

    });
