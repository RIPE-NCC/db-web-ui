angular.module("fmp").config(["$stateProvider",

    ($stateProvider: any) => {

        $stateProvider
            .state("fmp", {
                abstract: true,
                template: "<div ui-view></div>",
                url: "/fmp",
            })
            .state("fmp.requireLogin", {
                template: "<require-login></require-login>",
                url: "/requireLogin?mntnerKey&voluntary",
            })
            .state("fmp.find", {
                template: "<find-maintainer></find-maintainer>",
                url: "/",
            })
            .state("fmp.mailSent", {
                template: "<mail-sent></mail-sent>",
                url: "/mailSent/:email",
            })
            .state("fmp.ssoAdded", {
                template: "<sso-added></sso-added>",
                url: "/ssoAdded/:mntnerKey/:user",
            })
            .state("fmp.confirm", {
                template: "<confirm-maintainer></confirm-maintainer>",
                url: "/confirm?hash",
            })
            .state("fmp.forgotMaintainerPassword", {
                template: "<fmp></fmp>",
                url: "/change-auth?mntnerKey&voluntary",
            });

    }]);
