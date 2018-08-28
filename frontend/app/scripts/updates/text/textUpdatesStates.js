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
                        template: '<text-create></text-create>'
                    })
                    .state('textupdates.modify', {
                        url: '/modify/:source/:objectType/{name:WhoisObjectName}?noRedirect&rpsl',
                        templateUrl: 'scripts/updates/text/modify.html',
                        controller: 'TextModifyController'
                    })
                    .state('textupdates.multiDecision', {
                        url: '/multiDecision',
                        controller: '<text-multi-decision></text-multi-decision>'
                    })
                    .state('textupdates.multi', {
                        url: '/multi',
                        templateUrl: 'scripts/updates/text/multi.html',
                        controller: 'TextMultiController'
                    });

            }]);
})();
