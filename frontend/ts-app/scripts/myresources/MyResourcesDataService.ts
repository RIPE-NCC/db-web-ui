const mockResources = [
    "62.221.192.0/18 | ALLOCATED_PA | /db-web-ui/#/webupdates/modify/ripe/inetnum/62.221.192.0 - 62.221.255.255",
    "94.126.32.0/21 | ALLOCATED_PA | /db-web-ui/#/webupdates/modify/ripe/inetnum/94.126.32.0 - 94.126.39.255",
    "185.115.144.0/22 | ALLOCATED_PA | /db-web-ui/#/webupdates/modify/ripe/inetnum/185.115.144.0 - 185.115.147.255",
    "193.0.32.0-193.0.55.255 | ASSIGNED_PI | /db-web-ui/#/webupdates/modify/ripe/inetnum/193.0.32.0 - 193.0.55.255"];

class MyResourcesDataService implements IMyResourcesDataService {
    public static $inject = ["$log", "$http"];
    private ipv4Resources: Ipv4Resource[];

    constructor(private $log: angular.ILogService, private $http: ng.IHttpService) {
        this.ipv4Resources = [];
        this.mockPopulateIpv4Resources();
        this.populateIpv4Resources('ORG-IOB1-RIPE');
    }

    private mockPopulateIpv4Resources(): void {
        for (const str of mockResources) {
            const splits = str.split("|");
            const resource: Ipv4Resource = {
                prefix: splits[0].trim(),
                status: splits[1].trim(),
                whoisQueryUrl: splits[2].trim(),
            };
            this.ipv4Resources.push(resource);
        }
    }

    public populateIpv4Resources(orgid: string): void {
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
            },
            (response: any) : void => {
                console.log('get IPv4 Resources call failed: ' + response.statusText);
            });
    }

    public getIpv4Resources(): Ipv4Resource[] {
        return this.ipv4Resources;
    }
}

angular
    .module("dbWebApp")
    .service("MyResourcesDataService", MyResourcesDataService);
