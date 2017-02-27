
class MyResourcesDataService implements IMyResourcesDataService {
    public static $inject = ["$http", "$log", "$rootScope", "OrgDropDownStateService"];

    constructor(private $http: ng.IHttpService,
                private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private orgDropDownStateService: IOrgDropDownStateService) {
        $rootScope.$on("organisation-changed-event", (event: IAngularEvent, org: string) : void  => {
            this.$log.info("MyResourcesDataService: event " + org);
        });
    }

    public getIpv4Resources(orgid: string, callback: {(response: IPv4ResourcesResponse): void} ): void {
        this.$http({
            method: "GET",
            params: { orgid },
            timeout: 10000,
            url: "api/resources/ipv4",
        })
        .then(
            (response: ng.IHttpPromiseCallbackArg<IPv4ResourcesResponse>) : void => {
                this.$log.info("success ipv4resources: " + response.data.orgid);
                callback(response.data);
            },
            (response: any) : void => {
                this.$log.info("get IPv4 Resources call failed: " + response.statusText);
            });
    }
}

angular
    .module("dbWebApp")
    .service("MyResourcesDataService", MyResourcesDataService);
