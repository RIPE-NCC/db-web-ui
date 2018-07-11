// TODO convert to service
angular.module("dbWebApp")
    .constant("ERROR_EVENTS", {
        serverError: "server-error-occurred",
        notFound: "not-found",
        authenticationError: "authentication-error",
        forbiddenError: "forbidden",
        stateTransitionError: "$stateChangeError",
    })
    .factory("ErrorInterceptor",  ($rootScope: angular.IRootScopeService, $q: ng.IQService, $location: angular.ILocationService, $log: angular.ILogService, ERROR_EVENTS: any) => {

        function isServerError(status: number) {
            return status === 500;
        }

        function isAuthorisationError(status: number) {
            return status === 401;
        }

        function isForbiddenError(status: number) {
            return status === 403;
        }

        function isNotFoundError(status: number) {
            return status === 404;
        }

        function mustErrorBeSwallowed(response: ng.IHttpResponse<any>) {
            let toBeSwallowed = false;

            $log.debug("ui-url:" + $location.path());
            $log.debug("http-status:" + response.status);
            if (!_.isUndefined(response.config)) {
                $log.debug("rest-url:" + response.config.url);
                if (isAuthorisationError(response.status) && _.endsWith(response.config.url, "api/user/info")) {
                    toBeSwallowed = true;
                }
                if (isForbiddenError(response.status) && _.endsWith(response.config.url, "api/user/info")) {
                    toBeSwallowed = true;
                }
                if (isNotFoundError(response.status)) {
                    if (_.startsWith(response.config.url, "api/whois-internal/")) {
                        toBeSwallowed = true;
                    } else if ((response.config.params && response.config.params.ignore404 === true) ||
                        (response.config.url && response.config.url.indexOf("ignore404") > -1)) {
                        toBeSwallowed = true;
                    }
                }
                // TODO - We can remove the following code after WhoIs 1.86 deployment
                // Code added to prevent 500 exploding to the user during autocomplete.
                // The real way to fix it is in Whois, but we"re waiting it to be deployed.
                // NOTE..........
                // Added code to stop parent lookups from forcing nav to 404.html if they aren"t found.
                if ((isServerError(response.status) || isNotFoundError(response.status)) && _.startsWith(response.config.url, "api/whois/autocomplete")) {
                    toBeSwallowed = true;
                }
                if (isServerError(response.status) && _.startsWith(response.config.url, "api/dns/status")) {
                    toBeSwallowed = true;
                }
            }

            if (isNotFoundError(response.status) && _.startsWith($location.path(), "/textupdates/multi")) {
                toBeSwallowed = true;
            }

            $log.debug("Must be swallowed? " + toBeSwallowed);

            return toBeSwallowed;
        }

        return {
            responseError: (response: ng.IHttpResponse<any>) => {
                if (!mustErrorBeSwallowed(response)) {
                    $rootScope.$broadcast({
                        500: ERROR_EVENTS.serverError,
                        503: ERROR_EVENTS.serverError,
                        502: ERROR_EVENTS.serverError,
                        404: ERROR_EVENTS.notFound,
                        403: ERROR_EVENTS.forbiddenError,
                        401: ERROR_EVENTS.authenticationError,
                    }[response.status], response);
                }

                return $q.reject(response);
            },
        };
    })
    .config(($httpProvider: ng.IHttpProvider) => {
        $httpProvider.interceptors.push("ErrorInterceptor");
    });
