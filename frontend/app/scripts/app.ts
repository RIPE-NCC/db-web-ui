angular.module("dbWebApp", [
    "ui.router",
    "angular-loading-bar",
    "ngAnimate",
    "ngResource",
    "ngSanitize",
    "angulartics",
    "angulartics.google.tagmanager",
    "diff-match-patch",
    "ui.bootstrap",
    "ui.select",
    "ngCookies",
    "updates",
    "webUpdates",
    "textUpdates",
    "fmp",
    "loginStatus",
])

    .config(["$stateProvider", "$logProvider", "$httpProvider", "Properties",
        ($stateProvider: ng.ui.IStateProvider, $logProvider: angular.ILogProvider, $httpProvider: ng.IHttpProvider, Properties: any) => {

            // conditional log-level
            $logProvider.debugEnabled(["local", "dev", "prepdev"].indexOf(Properties.ENV) > -1);
            $stateProvider
                .state("error", {
                    templateUrl: "scripts/views/error.html",
                    url: "/public/error",
                })
                .state("notFound", {
                    templateUrl: "scripts/views/notFound.html",
                    url: "/public/not-found",
                })
                .state("confirmEmail", {
                    template: "<email-confirmation></email-confirmation>",
                    url: "/confirmEmail?t=:token",
                });

            // Always tell server if request was made using ajax
            $httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
        }])
    .run(["$rootScope", "$state", "$window", "$location", "$log", "ERROR_EVENTS", "Properties",
        ($rootScope: angular.IRootScopeService, $state: ng.ui.IStateService, $window: any, $location: ng.ILocationService,
         $log: angular.ILogService, ERROR_EVENTS: any, Properties: any) => {

            const destroyable = {
                four: {},
                one: {},
                three: {},
                two: {},
            }; // Hold listeners in this var so they get destroyed by ng

            destroyable.one = $rootScope.$on(ERROR_EVENTS.stateTransitionError, (event, toState, toParams, fromState, fromParams, err) => {
                $log.error("Error transitioning to state:" + angular.toJson(toState) + " due to error " + angular.toJson(err));

                if (err.status === 403 || err.status === 401) {
                    // redirect to crowd login screen
                    const returnUrl = $location.absUrl().split("#")[0] + $state.href(toState, toParams);
                    redirectToLogin(returnUrl);
                }
            });

            destroyable.two = $rootScope.$on(ERROR_EVENTS.serverError,  () => {
                $state.go("error");
            });

            destroyable.three = $rootScope.$on(ERROR_EVENTS.notFound, () => {
                $state.go("notFound");
            });

            destroyable.four = $rootScope.$on(ERROR_EVENTS.authenticationError, () => {
                // TODO do not act; authorisation errors during transition should be handled by stateTransitionError-handler above
                $log.error("Authentication error");
                const url = $location.absUrl();
                if (url.indexOf("myresources") > -1 || url.indexOf("modify") > -1 || url.indexOf("create") > -1) {
                    redirectToLogin(url);
                }
            });

            const redirectToLogin = (url: string) => {
                const crowdUrl = Properties.LOGIN_URL + "?originalUrl=" + encodeURIComponent(url);
                $log.info("Force crowd login:" + crowdUrl);
                $window.location.href = crowdUrl;
            };

        }])
    .controller("PageController", ["Properties", "Labels", (Properties, Labels) => {
        this.Properties = Properties;
        this.labels = Labels;
    }]);
