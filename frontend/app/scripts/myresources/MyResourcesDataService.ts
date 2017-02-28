import IHttpPromiseCallback = angular.IHttpPromiseCallback;
class MyResourcesDataService implements IMyResourcesDataService {
    public static $inject = ["$http", "$log", "$rootScope", "OrgDropDownStateService"];

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService) {
    }

    public getIpv4Resources(orgid: string): IPromise<IPv4ResourcesResponse> {
        return this.$http({
            method: "GET",
            params: {orgid},
            timeout: 10000,
            url: "api/resources/ipv4",
        });
    }
}

angular
    .module("dbWebApp")
    .service("MyResourcesDataService", MyResourcesDataService);
