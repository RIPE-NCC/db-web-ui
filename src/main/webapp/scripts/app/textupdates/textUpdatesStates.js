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
                .state('textupdates.create', {
                    url: '/create/:source/:objectType?noRedirect&rpsl',
                    templateUrl: 'scripts/app/textupdates/create.html',
                    controller: 'TextCreateController'
                })
                .state('textupdates.modify', {
                    url: '/modify/:source/:objectType/{name:WhoisObjectName}?noRedirect&rpsl',
                    templateUrl: 'scripts/app/textupdates/modify.html',
                    controller: 'TextModifyController'
                })
                .state('textupdates.multi', {
                    url: '/multi/:source',
                    templateUrl: 'scripts/app/textupdates/multi.html',
                    controller: 'TextMultiController'
                });

        }]);
