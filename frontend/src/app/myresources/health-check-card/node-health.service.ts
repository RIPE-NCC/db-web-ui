import { Injectable, computed, inject, signal } from '@angular/core';
import { from, of } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { HealthCheckableNode, NodeHealth, NodeHealthStatus } from './node-health.model';

@Injectable({
    providedIn: 'root',
})
export class NodeHealthService {
    private resourcesDataService = inject(ResourcesDataService);

    private readonly healthStates = signal<Map<string, NodeHealth>>(new Map());

    readonly healthStates$ = this.healthStates.asReadonly();

    readonly totalNodes = computed(() => this.healthStates().size);

    readonly okCount = computed(() => [...this.healthStates().values()].filter((health) => health.status === NodeHealthStatus.OK).length);

    readonly issuesCount = computed(() => [...this.healthStates().values()].filter((health) => health.status === NodeHealthStatus.ISSUES).length);

    readonly failedCount = computed(() => [...this.healthStates().values()].filter((health) => health.status === NodeHealthStatus.FAILED).length);

    readonly checkingCount = computed(() => [...this.healthStates().values()].filter((health) => health.status === NodeHealthStatus.NOT_CHECKED).length);

    checkNodeHealth(node: HealthCheckableNode) {
        return this.resourcesDataService.checkIsAnnounced(node.type, node.nodeName).pipe(
            tap((response) => {
                this.updateHealth(node, response.length > 0 ? NodeHealthStatus.ISSUES : NodeHealthStatus.OK, response.length);
            }),

            catchError(() => {
                this.updateHealth(node, NodeHealthStatus.FAILED, 0);

                return of(null);
            }),
        );
    }

    healthCheck(nodes: HealthCheckableNode[]): void {
        from(nodes)
            .pipe(mergeMap((node) => this.checkNodeHealth(node), 5))
            .subscribe();
    }

    private updateHealth(node: HealthCheckableNode, status: NodeHealthStatus, issuesCount: number): void {
        const key = this.getKey(node);

        this.healthStates.update((current) => {
            const next = new Map(current);

            next.set(key, {
                status,
                issuesCount,
            });

            return next;
        });
    }

    private getKey(node: HealthCheckableNode): string {
        return `${node.type}:${node.nodeName}`;
    }
}
