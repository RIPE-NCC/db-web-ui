// Shown on My resources page - for all resources listed in tab
import {Component, Input, SimpleChanges} from "@angular/core";
import {IpUsageService} from "./ip-usage.service";
import {ResourceStatusService} from "./resource-status.service";

@Component({
    selector: "ip-usage-of-all-resources",
    templateUrl: "./ip-usage-of-all-resources.component.html",
})
export class IpUsageOfAllResourcesComponent {

    // Inputs
    @Input()
    public resources: any[];
    @Input()
    public type: string;
    @Input()
    public sponsored: boolean;

    public total: number;
    public used: number;
    public free: number;

    public ipv6CalcTotal: string;
    public ipv6CalcUsed: string;
    public ipv6CalcFree: string;

    constructor(private resourceStatusService: ResourceStatusService,
                private ipUsageService: IpUsageService) {
    }

    public ngOnChanges(changes: SimpleChanges) {
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
            if (this.resourceStatusService.isResourceWithUsage(resource.type, resource.status)) {
                this.total += resource.usage.total;
                this.used += resource.usage.used;
            }
        }
        this.free = this.ipUsageService.calcFreeSpace(this.total, this.used);
    }

    private calcValueForIPv6() {
        this.ipv6CalcTotal = this.ipUsageService.calcShorterValue(this.total);
        this.ipv6CalcUsed = this.ipUsageService.calcShorterValue(this.used);
        this.ipv6CalcFree = this.ipUsageService.calcShorterValue(this.free);
    }
}
