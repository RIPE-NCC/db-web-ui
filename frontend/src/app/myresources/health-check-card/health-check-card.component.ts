import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';

@Component({
    selector: 'health-check-card',
    templateUrl: './health-check-card.component.html',
    styleUrl: './health-check-card.component.scss',
    imports: [MatProgressSpinnerModule],
})
export class HealthCheckCardComponent {
    private nodeHealthService = inject(NodeHealthService);

    readonly okCount = this.nodeHealthService.okCount;
    readonly issuesCount = this.nodeHealthService.issuesCount;
    readonly failedCount = this.nodeHealthService.failedCount;
    readonly checkingCount = this.nodeHealthService.checkingCount;
}
