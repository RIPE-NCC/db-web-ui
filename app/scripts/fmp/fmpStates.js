/*global angular*/

(function () {
    'use strict';

    angular.module('fmp').config(['$stateProvider',

        function ($stateProvider) {

            $stateProvider
                .state('fmp', {
                    abstract: true,
                    url: '/fmp',
                    template: '<div ui-view></div>'
                })
                .state('fmp.requireLogin', {
                    url: '/requireLogin',
                    templateUrl: 'scripts/fmp/requireLogin.html',
                    controller: 'RequireLoginCtrl'
                })
                .state('fmp.find', {
                    url: '/',
                    templateUrl: 'scripts/fmp/findMaintainer.html',
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
                .state('fmp.mailSent', {
                    url: '/mailSent/:email',
                    templateUrl: 'scripts/fmp/mailSent.html',
                    controller: 'MailSentCtrl'
                })
                .state('fmp.ssoAdded', {
                    url: '/ssoAdded/:mntnerKey/:user',
                    templateUrl: 'scripts/fmp/ssoAdded.html',
                    controller: 'SsoAddedCtrl'
                })
                .state('fmp.confirm', {
                    url: '/confirm?hash',
                    templateUrl: 'scripts/fmp/confirmMaintainer.html',
                    controller: 'ConfirmMaintainerCtrl'
                });

        }]);
})();
