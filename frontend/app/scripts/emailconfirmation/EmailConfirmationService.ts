class EmailConfirmationService {

    public static $inject = ["$http", "$log"];
    private readonly API_BASE_URL: string = "api/whois-internal/api/abuse-validation/validate-token";

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService) {
    }

    public confirmEmail(token: string): ng.IPromise<any> {
        if (!token) {
            this.$log.error("Confirming email", token);
            throw new TypeError("ResourcesDataService.fetchParentResource failed: not a resource");
        }

        const config: angular.IRequestShortcutConfig = {};
        config.params = {
            token,
        };
        return this.$http.get(this.API_BASE_URL, config);
    }
}

angular
    .module("dbWebApp")
    .service("EmailConfirmationService", EmailConfirmationService);
