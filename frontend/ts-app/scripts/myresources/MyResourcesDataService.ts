const mockResources = [
    "62.221.192.0/18 | ALLOCATED_PA | /db-web-ui/#/webupdates/modify/ripe/inetnum/62.221.192.0 - 62.221.255.255",
    "94.126.32.0/21 | ALLOCATED_PA | /db-web-ui/#/webupdates/modify/ripe/inetnum/94.126.32.0 - 94.126.39.255",
    "185.115.144.0/22 | ALLOCATED_PA | /db-web-ui/#/webupdates/modify/ripe/inetnum/185.115.144.0 - 185.115.147.255",
    "193.0.32.0-193.0.55.255 | ASSIGNED_PI | /db-web-ui/#/webupdates/modify/ripe/inetnum/193.0.32.0 - 193.0.55.255"];

class MyResourcesDataServiceMockImpl implements IMyResourcesDataService {
    public static $inject = ["$log"];
    private ipv4Resources: Ipv4Resource[];

    constructor(private $log: angular.ILogService) {
        this.ipv4Resources = [];
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

    public getIpv4Resources(): Ipv4Resource[] {
        return this.ipv4Resources;
    }
}

angular
    .module("dbWebApp")
    .service("IMyResourcesDataService", MyResourcesDataServiceMockImpl);
