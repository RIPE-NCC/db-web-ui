const SIZE: string[] = ["", "K", "M", "G", "T"];

class UsageStatusController {

    // Inputs
    public type: string;
    public usage: IUsage;

    // Outputs
    public percentageFree: number;
    public percentageUsed: number;
    public ipv6CalcTotal: string;
    public ipv6CalcUsed: string;
    public ipv6CalcFree: string;

    constructor() {
    }

    public $onChanges(): void {
        this.usage.free = this.calcFreeSpace();
        this.calcPercentage();
        this.calcValueForIPv6();
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
        type: "<",
        usage: "<",
    },
    controller: UsageStatusController,
    templateUrl: "scripts/myresources/usage-status.html",
});
