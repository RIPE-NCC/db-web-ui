angular.module("fmp").config(["$stateProvider",

    ($stateProvider: any) => {

        $stateProvider
            .state("fmp", {
                abstract: true,
                url: "/fmp",
                template: "<div ui-view></div>",
            })
            .state("fmp.requireLogin", {
                url: "/requireLogin?mntnerKey&voluntary",
                template: "<require-login></require-login>",
            })
            .state("fmp.find", {
                url: "/",
                template: "<find-maintainer></find-maintainer>",
            })
            .state("fmp.mailSent", {
                url: "/mailSent/:email",
                templateUrl: "scripts/fmp/mailSent.html",
                controller: "MailSentCtrl",
            })
            .state("fmp.ssoAdded", {
                url: "/ssoAdded/:mntnerKey/:user",
                templateUrl: "scripts/fmp/ssoAdded.html",
                controller: "SsoAddedCtrl",
            })
            .state("fmp.confirm", {
                url: "/confirm?hash",
                templateUrl: "scripts/fmp/confirmMaintainer.html",
                controller: "ConfirmMaintainerCtrl",
            })
            .state("fmp.forgotMaintainerPassword", {
                url: "/change-auth?mntnerKey&voluntary",
                template: "<fmp></fmp>",
            });

    }]);
