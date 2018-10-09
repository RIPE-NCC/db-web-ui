class ErrorInterceptorService {
    public static $inject = ["$rootScope", "$q", "$location", "$log", "ERROR_EVENTS"];

    constructor(public $rootScope: angular.IRootScopeService,
                public $q: ng.IQService,
                public $location: angular.ILocationService,
                public $log: angular.ILogService,
                public ERROR_EVENTS: any) {
    }

    public responseError = (response: ng.IHttpResponse<any>) => {
        if (!this.mustErrorBeSwallowed(response)) {
            this.$rootScope.$broadcast({
                500: this.ERROR_EVENTS.serverError,
                503: this.ERROR_EVENTS.serverError,
                502: this.ERROR_EVENTS.serverError,
                404: this.ERROR_EVENTS.notFound,
                403: this.ERROR_EVENTS.forbiddenError,
                401: this.ERROR_EVENTS.authenticationError,
            }[response.status], response);
        }
        return this.$q.reject(response);
    }

    private isServerError(status: number) {
        return status === 500;
    }

    private isAuthorisationError(status: number) {
        return status === 401;
    }

    private isForbiddenError(status: number) {
        return status === 403;
    }

    private isNotFoundError(status: number) {
        return status === 404;
    }

    private mustErrorBeSwallowed = (response: ng.IHttpResponse<any>) => {
        let toBeSwallowed = false;

        this.$log.debug("ui-url:" + this.$location.path());
        this.$log.debug("http-status:" + response.status);
        if (!_.isUndefined(response.config)) {
            this.$log.debug("rest-url:" + response.config.url);
            if (this.isAuthorisationError(response.status) && _.endsWith(response.config.url, "api/user/info")) {
                toBeSwallowed = true;
            }
            if (this.isForbiddenError(response.status) && _.endsWith(response.config.url, "api/user/info")) {
                toBeSwallowed = true;
            }
            if (this.isNotFoundError(response.status)) {
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
            if ((this.isServerError(response.status) || this.isNotFoundError(response.status)) && _.startsWith(response.config.url, "api/whois/autocomplete")) {
                toBeSwallowed = true;
            }
            if (this.isServerError(response.status) && _.startsWith(response.config.url, "api/dns/status")) {
                toBeSwallowed = true;
            }
        }

        if (this.isNotFoundError(response.status) && _.startsWith(this.$location.path(), "/textupdates/multi")) {
            toBeSwallowed = true;
        }

        this.$log.debug("Must be swallowed? " + toBeSwallowed);

        return toBeSwallowed;
    }
}

angular.module("dbWebApp")
    .constant("ERROR_EVENTS", {
        authenticationError: "authentication-error",
        forbiddenError: "forbidden",
        notFound: "not-found",
        serverError: "server-error-occurred",
        stateTransitionError: "$stateChangeError",
    })
    .service("ErrorInterceptor",  ErrorInterceptorService)
    .config(($httpProvider: ng.IHttpProvider) => {
        $httpProvider.interceptors.push("ErrorInterceptor");
    });
