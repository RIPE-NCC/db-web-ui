'use strict';

angular.module('webUpdates', ['dbWebApp'])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('webupdates/select');

        $stateProvider
            .state('select', {
                url: '/webupdates/select',
                templateUrl: 'scripts/app/webupdates/select.html',
                controller: 'SelectController'
            })
            .state('create', {
                url: '/webupdates/create/:objectType/:source',
                templateUrl: 'scripts/app/webupdates/create.html',
                controller: 'CreateController'
            })
            .state('display', {
                url: '/webupdates/display/:objectType/:name',
                templateUrl: 'scripts/app/webupdates/display.html',
                controller: 'DisplayController'
            });

    });
