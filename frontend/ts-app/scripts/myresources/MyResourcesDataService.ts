
class MyResourcesDataService implements IMyResourcesDataService {
    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService, private $http: ng.IHttpService) {
    }

    public getIpv4Resources(orgid: string, callback: {(response: IPv4ResourcesResponse): void} ): void {
        this.$http({
            method: 'GET',
            url: 'api/resources/ipv4',
            params: {
                orgid: orgid
            },
            timeout: 10000
        })
        .then(
            (response: ng.IHttpPromiseCallbackArg<IPv4ResourcesResponse>) : void => {
                console.log('success ipv4resources: ' + response.data.orgid);
                callback(response.data);
            },
            (response: any) : void => {
                console.log('get IPv4 Resources call failed: ' + response.statusText);
            });
    }
}

angular
    .module("dbWebApp")
    .service("MyResourcesDataService", MyResourcesDataService);
