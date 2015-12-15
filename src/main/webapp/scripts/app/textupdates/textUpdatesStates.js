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
                    controller: 'TextController'
                })
                .state('textupdates.create', {
                    url: '/create/:source/:objectType',
                    templateUrl: 'scripts/app/textupdates/create.html',
                    controller: 'TextCreateController'
                })
                .state('textupdates.modify', {
                    url: '/modify/:source/:objectType/:name',
                    templateUrl: 'scripts/app/textupdates/modify.html',
                    controller: 'TextModifyController'
                })
                .state('textupdates.display', {
                    url: '/display/:source/:objectType/:name',
                    templateUrl: 'scripts/app/textupdates/display.html',
                    controller: 'TextController'
                })
                .state('textupdates.delete', {
                    url: '/delete/:source/:objectType/:name',
                    templateUrl: 'scripts/app/textupdates/delete.html',
                    controller: 'TextController'
                });

        }]);
