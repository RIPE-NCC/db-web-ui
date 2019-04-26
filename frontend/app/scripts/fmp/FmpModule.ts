angular.module("fmp", ["dbWebApp"])
    .constant(
        "FMP_STATE", {
            REQUIRE_LOGIN: "fmp.requireLogin",
            FIND: "fmp.find",
            CONFIRM: "fmp.confirm",
            SSO_ADDED: "fmp.ssoAdded",
            MAIL_SENT: "fmp.mailSent",
        })
    .run(["$rootScope", "$state", "$log", ($rootScope: angular.IRootScopeService, $state: ng.ui.IStateService, $log: angular.ILogService) => {

        // expand the forgot-mntner-password section of the menu
        $rootScope.$on("$stateChangeSuccess", (event, toState) => {
            if (!_.isUndefined(toState) && !_.isUndefined(toState.name) && _.startsWith(toState.name, "fmp.")) {
                $log.debug("fmp: Incoming transition to state: " + toState.name);
                $rootScope.$emit("dbWebApp.moduleActive", "passwords");
            }
        });

    }]);