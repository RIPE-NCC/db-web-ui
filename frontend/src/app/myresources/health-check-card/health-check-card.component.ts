import { Component, computed, inject, input } from '@angular/core';
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

    treeType = input.required<string>();

    private readonly currentNodes = computed(() => this.nodeHealthService.nodes()[this.treeType()] ?? []);

    readonly checkingCount = computed(() => this.currentNodes().filter((node) => node.healthStatus() === NodeHealthStatus.NOT_CHECKED).length);

    readonly okCount = computed(() => this.currentNodes().filter((node) => node.healthStatus() === NodeHealthStatus.OK).length);

    readonly issuesCount = computed(() => this.currentNodes().filter((node) => node.healthStatus() === NodeHealthStatus.ISSUES).length);

    readonly failedCount = computed(() => this.currentNodes().filter((node) => node.healthStatus() === NodeHealthStatus.FAILED).length);
}
