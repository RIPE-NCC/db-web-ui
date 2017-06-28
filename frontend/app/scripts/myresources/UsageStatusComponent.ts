const SIZE: string[] = ["", "K", "M", "G", "T"];

class UsageStatusController {

    public static $inject = ["$log", "ResourcesDataService"];

    public resource: IResourceModel;

    private usage: IUsage;
    private percentageFree: number;
    private percentageUsed: number;

    private ipv6CalcTotal: string;
    private ipv6CalcUsed: string;
    private ipv6CalcFree: string;

    constructor(private $log: angular.ILogService,
                private myResourcesDataService: IResourcesDataService) {
    }

    public $onChanges(): void {
        if (this.resource) {
            this.getResource();
        }
    }

    private getResource(): void {
        if (this.resource.type.toLowerCase() === "inetnum") {
            this.myResourcesDataService.fetchIpv4Resource(this.resource.resource).then(
                (response: IHttpPromiseCallbackArg<IPv4ResourcesResponse>) => {
                    this.processUsage(response);
                });
        } else if (this.resource.type.toLowerCase() === "inet6num") {
            this.myResourcesDataService.fetchIpv6Resource(this.resource.resource).then(
                (response: IHttpPromiseCallbackArg<IPv6ResourcesResponse>) => {
                    this.processUsage(response);
                    this.calcValueForIPv6();
                });
        }
    }

    private processUsage(response: IHttpPromiseCallbackArg<any>) {
        if (!response.data.resources || !response.data.resources.length) {
            return;
        }
        this.usage = response.data.resources[0].usage;
        this.usage.free = this.calcFreeSpace();
        // calculate percentage before calculating shorter value with binary prefix
        this.calcPercentage();
    }

    private calcFreeSpace(): number {
        return this.usage.total - this.usage.used;
    }

    private calcPercentage() {
        this.percentageUsed = Math.round(this.usage.used * 100 / this.usage.total);
        this.percentageFree = 100 - this.percentageUsed;
    }

    private calcValueForIPv6() {
        if (!this.usage) {
            return;
        }
        this.ipv6CalcTotal = this.calcShorterValue(this.usage.total);
        this.ipv6CalcUsed = this.calcShorterValue(this.usage.used);
        this.ipv6CalcFree = this.calcShorterValue(this.usage.free);
    }

    private calcShorterValue(value: number): string {
        if (value === undefined) {
            return "";
        }
        let counter = 0;
        while (value >= 1024) {
            value = value / 1024;
            counter++;
        }
        return Math.round(value) + SIZE[counter];
    }
}

angular.module("dbWebApp").component("usageStatus", {
    bindings: {
        resource: "<",
    },
    controller: UsageStatusController,
    controllerAs: "ctrlUsage",
    templateUrl: "scripts/myresources/usage-status.html",
});
