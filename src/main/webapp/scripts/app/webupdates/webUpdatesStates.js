    'use strict';

angular.module('webUpdates')
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('webupdates/select');

        $stateProvider
            .state('createPersonMntnerPair', {
                url: '/webupdates/create/:source/person/self',
                templateUrl: 'scripts/app/webupdates/createPersonMntnerPair.html',
                controller: 'CreatePersonMntnerPairController'
            })
            .state('displayPersonMntnerPair', {
                url: '/webupdates/display/:source/person/:person/mntner/:mntner',
                templateUrl: 'scripts/app/webupdates/displayPersonMntnerPair.html',
                controller: 'DisplayPersonMntnerPairController'
            })
            .state('createSelfMnt', {
                url: '/webupdates/create/:source/mntner/self?admin',
                templateUrl: 'scripts/app/webupdates/createSelfMaintainedMaintainer.html',
                controller: 'CreateSelfMaintainedMaintainerController'
            })
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
                url: '/webupdates/modify/:source/:objectType/*name',
                templateUrl: 'scripts/app/webupdates/create.html',
                controller: 'CreateController'
            })
            .state('display', {
                url: '/webupdates/display/:source/:objectType/*name?method',
                templateUrl: 'scripts/app/webupdates/display.html',
                controller: 'DisplayController'
            })
            .state('deleted', {
                url: '/webupdates/deleted/:source/:objectType/*name',
                templateUrl: 'scripts/app/webupdates/deleted.html',
                controller: function($scope, $stateParams){
                   $scope.source = $stateParams.source;
                   $scope.objectType = $stateParams.objectType;
                   $scope.name = $stateParams.name;
                }
            });

    });
