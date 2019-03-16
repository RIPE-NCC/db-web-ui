class IpUsageController {

    // Inputs
    public type: string;
    public usage: IUsage;

    // Outputs
    public percentageFree: number;
    public percentageUsed: number;
    public ipv6CalcTotal: string;
    public ipv6CalcUsed: string;
    public ipv6CalcFree: string;

    constructor(private IpUsageService: IpUsageService) {}

    public $onChanges(): void {
        this.usage.free = this.IpUsageService.calcFreeSpace(this.usage.total, this.usage.used);
        this.calcPercentage();
        this.calcValueForIPv6();
    }

    private calcPercentage() {
        this.percentageUsed = Math.round(this.usage.used * 100 / this.usage.total);
        this.percentageFree = 100 - this.percentageUsed;
    }

    private calcValueForIPv6() {
        if (!this.usage) {
            return;
        }
        this.ipv6CalcTotal = this.IpUsageService.calcShorterValue(this.usage.total);
        this.ipv6CalcUsed = this.IpUsageService.calcShorterValue(this.usage.used);
        this.ipv6CalcFree = this.IpUsageService.calcShorterValue(this.usage.free);
    }
}

angular.module("dbWebApp").component("ipUsage", {
    bindings: {
        type: "<",
        usage: "<",
    },
    controller: IpUsageController,
    templateUrl: "./ip-usage.html",
});
