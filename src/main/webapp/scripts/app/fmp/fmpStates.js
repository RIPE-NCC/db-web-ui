'use strict';

angular.module('fmp')
    .config(['$stateProvider',
        function ($stateProvider) {

            $stateProvider
                .state('fmp', {
                    abstract: true,
                    url: '/fmp',
                    template: '<div ui-view></div>'
                })
                .state('fmp.find', {
                    url: '/',
                    templateUrl: 'scripts/app/fmp/findMaintainer.html',
                    controller: 'FindMaintainerCtrl'
                })
                .state('fmp.voluntary', {
                    url: '/legacy/:maintainerKey/voluntary',
                    template: '<div></div>',
                    controller: 'VoluntarilyRedirectToLegacyCtrl'
                })
                .state('fmp.legacy', {
                    url: '/legacy/:maintainerKey',
                    template: '<div></div>',
                    controller: 'RedirectToLegacyCtrl'
                })
                .state('fmp.confirm', {
                    url: '/confirm',
                    templateUrl: 'scripts/app/fmp/confirmMaintainer.html',
                    controller: 'ConfirmMaintainerCtrl'
                });

        }]);
