'use strict';

angular.module('textUpdates')
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            $stateProvider
                .state('textupdates', {
                    abstract: true,
                    url: '/textupdates',
                    template: '<div ui-view></div>'
                })
                .state('textupdates.select', {
                    url: '/select',
                    templateUrl: 'scripts/app/textupdates/select.html',
                    controller: 'TextUpdatesController'
                })
                .state('textupdates.create', {
                    url: '/create/:source/:objectType',
                    templateUrl: 'scripts/app/textupdates/create.html',
                    controller: 'TextUpdatesController'
                })
                .state('textupdates.modify', {
                    url: '/modify/:source/:objectType/:name',
                    templateUrl: 'scripts/app/textupdates/modify.html',
                    controller: 'TextUpdatesController'
                })
                .state('textupdates.display', {
                    url: '/display/:source/:objectType/:name',
                    templateUrl: 'scripts/app/textupdates/display.html',
                    controller: 'TextUpdatesController'
                })
                .state('textupdates.delete', {
                    url: '/delete/:source/:objectType/:name',
                    templateUrl: 'scripts/app/textupdates/delete.html',
                    controller: 'TextUpdatesController'
                });

        }]);
