const mockAlloc = ["20030210 | 62.221.192.0/18 | 16384 | ALLOCATED_PA | " +
    "https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/62.221.192.0 - 62.221.255.255",
    "20080915 | 94.126.32.0/21 | 2048 | ALLOCATED_PA | " +
    "https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/94.126.32.0 - 94.126.39.255",
    "20150902 | 185.115.144.0/22 | 1024 | ALLOCATED_PA | " +
    "https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/185.115.144.0 - 185.115.147.255"];

const mockAss = "19980108 | 193.0.32.0-193.0.55.255 | ASSIGNED_PI | Integrated Internet Services B.V. | LIR infrastructure | https://apps.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/193.0.32.0 - 193.0.55.255";

class MyResourcesDataService {
    public static $inject = ["$log"];
    private ipv4Allocations: Ipv4Allocation[];
    private ipv4Assignments: Ipv4Assignment[];

    constructor(private $log: angular.ILogService) {
        this.ipv4Allocations = [];
        for (const str of mockAlloc) {
            const splits = str.split("|");
            const resource: Ipv4Allocation = {
                date: splits[0].trim(),
                editLink: splits[4].trim(),
                prefix: splits[1].trim(),
                size: parseInt(splits[2], 10),
                status: splits[3].trim(),
            };
            this.ipv4Allocations.push(resource);
        }
        const splits = mockAss.split("|");
        const ass: Ipv4Assignment = {
            date: splits[0].trim(),
            editLink: splits[5].trim(),
            indResInfo: splits[4].trim(),
            organization: splits[3].trim(),
            prefix: splits[1].trim(),
            status: splits[2].trim(),
        };
        this.ipv4Assignments = [ass];
    }

    public getIpv4Allocations(): Ipv4Allocation[] {
        return this.ipv4Allocations;
    }

    public getIpv4Assignments() {
        return this.ipv4Assignments;
    }
}

angular
    .module("dbWebApp")
    .service("MyResourcesDataService", MyResourcesDataService);
