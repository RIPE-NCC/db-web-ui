const mockData = ["20030210 | 62.221.192.0/18 | 16384 | ALLOCATED_PA | https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/62.221.192.0 - 62.221.255.255",
    "20080915 | 94.126.32.0/21 | 2048 | ALLOCATED_PA | https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/94.126.32.0 - 94.126.39.255",
    "20150902 | 185.115.144.0/22 | 1024 | ALLOCATED_PA | https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/185.115.144.0 - 185.115.147.255"];

class MyResourcesDataService {
    public static $inject = ["$log"];
    private ipv4Resources: Ipv4Resource[];

    constructor(private $log: angular.ILogService) {
        this.ipv4Resources = [];
        for (const str of mockData) {
            const splits = str.split("|");
            const resource: Ipv4Resource = {
                date: splits[0].trim(),
                editLink: splits[4].trim(),
                prefix: splits[1].trim(),
                size: parseInt(splits[2], 10),
                status: splits[3].trim(),
            };
            this.ipv4Resources.push(resource);
        }
        this.$log.debug(">>>> where are you going with those resources", this.ipv4Resources);
    }

    public getIpv4Resources(): Ipv4Resource[] {
        return this.ipv4Resources;
    }
}

angular
    .module("dbWebApp")
    .service("MyResourcesDataService", MyResourcesDataService);
