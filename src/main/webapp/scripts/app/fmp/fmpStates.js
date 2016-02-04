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
                .state('fmp.requireLogin', {
                    url: '/requireLogin',
                    templateUrl: 'scripts/app/fmp/requireLogin.html',
                    controller: 'RequireLoginCtrl'
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
                .state('fmp.mailSent', {
                    url: '/mailSent/:email',
                    templateUrl:  'scripts/app/fmp/mailSent.html',
                    controller: 'MailSentCtrl'
                })
                .state('fmp.ssoAdded', {
                    url: '/ssoAdded/:user',
                    templateUrl:  'scripts/app/fmp/ssoAdded.html',
                    controller: 'SsoAddedCtrl'
                })
                .state('fmp.confirm', {
                    url: '/confirm?hash',
                    templateUrl: 'scripts/app/fmp/confirmMaintainer.html',
                    controller: 'ConfirmMaintainerCtrl'
                });

        }]);
