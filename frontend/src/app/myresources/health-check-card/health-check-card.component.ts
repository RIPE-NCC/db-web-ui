import { Component, computed, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { NodeHealthStatus } from './node-health.model';

@Component({
    selector: 'health-check-card',
    templateUrl: './health-check-card.component.html',
    styleUrl: './health-check-card.component.scss',
    imports: [MatProgressSpinnerModule],
})
export class HealthCheckCardComponent {
    private nodeHealthService = inject(NodeHealthService);

    readonly nodes = computed(() => Object.values(this.nodeHealthService.nodes()).flat());

    readonly checkingCount = computed(() => this.nodes().filter((node) => node.healthStatus() === NodeHealthStatus.NOT_CHECKED).length);

    readonly okCount = computed(() => this.nodes().filter((node) => node.healthStatus() === NodeHealthStatus.OK).length);

    readonly issuesCount = computed(() => this.nodes().filter((node) => node.healthStatus() === NodeHealthStatus.ISSUES).length);

    readonly failedCount = computed(() => this.nodes().filter((node) => node.healthStatus() === NodeHealthStatus.FAILED).length);

    readonly cardStatus = computed(() => {
        if (this.checkingCount() > 0) {
            return 'checking';
        }

        if (this.issuesCount() > 0) {
            return 'issues';
        }

        if (this.okCount() > 0) {
            return 'healthy';
        }

        if (this.failedCount() > 0) {
            return 'failed';
        }

        return '';
    });

    refresh(): void {
        this.nodeHealthService.refreshAll();
    }
}
