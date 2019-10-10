import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {IUsage} from "./resource-type.model";
import {IpUsageService} from "./ip-usage.service";

@Component({
    selector: "ip-usage",
    templateUrl: "./ip-usage.component.html",
})
export class IpUsageComponent implements OnChanges {

    // Inputs
    @Input()
    public type: string;
    @Input()
    public usage: IUsage;

    // Outputs
    public percentageFree: number;
    public percentageUsed: number;
    public ipv6CalcTotal: string;
    public ipv6CalcUsed: string;
    public ipv6CalcFree: string;

    constructor(private ipUsageService: IpUsageService) {}

    public ngOnChanges(changes: SimpleChanges) {
        this.usage.free = this.ipUsageService.calcFreeSpace(this.usage.total, this.usage.used);
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
        this.ipv6CalcTotal = this.ipUsageService.calcShorterValue(this.usage.total);
        this.ipv6CalcUsed = this.ipUsageService.calcShorterValue(this.usage.used);
        this.ipv6CalcFree = this.ipUsageService.calcShorterValue(this.usage.free);
    }
}
