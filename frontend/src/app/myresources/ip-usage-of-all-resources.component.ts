// Shown on Resources page - for all resources listed in tab
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HealthCheckCardComponent } from 'src/app/myresources/health-check-card/health-check-card.component';
import { IpUsageService } from './ip-usage.service';
import { ResourceStatusService } from './resource-status.service';

@Component({
    selector: 'ip-usage-of-all-resources',
    templateUrl: './ip-usage-of-all-resources.component.html',
    styleUrl: './ip-usage-of-all-resources.component.scss',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [HealthCheckCardComponent],
})
export class IpUsageOfAllResourcesComponent implements OnChanges {
    private resourceStatusService = inject(ResourceStatusService);
    private ipUsageService = inject(IpUsageService);

    @Input()
    resources: any[];
    @Input()
    type: string;
    @Input()
    sponsored: boolean;

    total: number;
    used: number;
    free: number;
    usedPercentage: number;

    ipv6CalcTotal: string;
    ipv6CalcUsed: string;
    ipv6CalcFree: string;

    ngOnChanges(_changes: SimpleChanges) {
        this.setResourcesIpUsage();
        if (this.type === 'inet6num') {
            this.calcValueForIPv6();
        }
    }

    private resetResourcesIpUsageStatistic() {
        this.total = 0;
        this.used = 0;
        this.free = 0;
        this.usedPercentage = 0;
    }

    private setResourcesIpUsage() {
        this.resetResourcesIpUsageStatistic();
        for (const resource of this.resources) {
            if (this.resourceStatusService.isResourceWithUsage(resource.type, resource.status)) {
                this.total += resource.usage.total;
                this.used += resource.usage.used;
            }
        }
        this.usedPercentage = this.used > 0 ? Math.round((this.used * 100) / this.total) : 0;
        this.free = this.ipUsageService.calcFreeSpace(this.total, this.used);
    }

    private calcValueForIPv6() {
        this.ipv6CalcTotal = this.ipUsageService.calcShorterValue(this.total);
        this.ipv6CalcUsed = this.ipUsageService.calcShorterValue(this.used);
        this.ipv6CalcFree = this.ipUsageService.calcShorterValue(this.free);
    }
}
