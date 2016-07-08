/*global angular*/

(function () {
    'use strict';

    angular.module('textUpdates').config(['$stateProvider',
        
            function ($stateProvider) {

                $stateProvider
                    .state('textupdates', {
                        abstract: true,
                        url: '/textupdates',
                        template: '<div ui-view></div>'
                    })
                    .state('textupdates.create', {
                        url: '/create/:source/:objectType?noRedirect&rpsl',
                        templateUrl: 'scripts/app/updates/text/create.html',
                        controller: 'TextCreateController'
                    })
                    .state('textupdates.modify', {
                        url: '/modify/:source/:objectType/{name:WhoisObjectName}?noRedirect&rpsl',
                        templateUrl: 'scripts/app/updates/text/modify.html',
                        controller: 'TextModifyController'
                    })
                    .state('textupdates.multiDecision', {
                        url: '/multiDecision',
                        templateUrl: 'scripts/app/updates/text/multiDecision.html',
                        controller: 'TextMultiDecisionController'
                    })
                    .state('textupdates.multi', {
                        url: '/multi',
                        templateUrl: 'scripts/app/updates/text/multi.html',
                        controller: 'TextMultiController'
                    });

            }]);
})();
