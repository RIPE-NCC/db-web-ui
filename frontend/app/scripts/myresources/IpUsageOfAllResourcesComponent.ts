// Shown on My resources page - for all resources listed in tab
class IpUsageOfAllResourcesController {

    public static $inject = ["ResourceStatus", "IpUsageService"];

    // Inputs
    public resources: any[];
    public type: string;
    public sponsored: boolean;

    public total: number;
    public used: number;
    public free: number;

    public ipv6CalcTotal: string;
    public ipv6CalcUsed: string;
    public ipv6CalcFree: string;

    constructor(private ResourceStatus: ResourceStatus,
                private IpUsageService: IpUsageService) {
    }

    public $onChanges(): void {
        this.setResourcesIpUsage();
        if (this.type === "inet6num") {
            this.calcValueForIPv6();
        }
    }

    private resetResourcesIpUsageStatistic() {
        this.total = 0;
        this.used = 0;
        this.free = 0;
    }

    private setResourcesIpUsage() {
        this.resetResourcesIpUsageStatistic();
        for (const resource of this.resources) {
            if (this.ResourceStatus.isResourceWithUsage(resource.type, resource.status)) {
                this.total += resource.usage.total;
                this.used += resource.usage.used;
            }
        }
        this.free = this.IpUsageService.calcFreeSpace(this.total, this.used);
    }

    private calcValueForIPv6() {
        this.ipv6CalcTotal = this.IpUsageService.calcShorterValue(this.total);
        this.ipv6CalcUsed = this.IpUsageService.calcShorterValue(this.used);
        this.ipv6CalcFree = this.IpUsageService.calcShorterValue(this.free);
    }

}

angular.module("dbWebApp").component("ipUsageOfAllResources", {
    bindings: {
        resources: "<",
        type: "<",
        sponsored: "<",
    },
    controller: IpUsageOfAllResourcesController,
    templateUrl: "./ip-usage-of-all-resources.html",
});
