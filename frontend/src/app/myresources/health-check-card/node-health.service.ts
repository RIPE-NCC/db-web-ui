import { Injectable, inject, signal } from '@angular/core';
import { from, of } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
import { TreeNode } from 'src/app/myresources/tree/tree.component';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { ResourcesDataService } from '../resources-data.service';
import { NodeHealthStatus } from './node-health.model';

@Injectable({
    providedIn: 'root',
})
export class NodeHealthService {
    private resourcesDataService = inject(ResourcesDataService);

    readonly nodes = signal<Record<string, TreeNode[]>>({});

    registerNodes(treeType: string, nodes: TreeNode[]): void {
        this.nodes.update((current) => {
            const nodesByKey = new Map((current[treeType] ?? []).map((node) => [this.getNodeKey(node), node]));

            nodes.forEach((node) => {
                nodesByKey.set(this.getNodeKey(node), node);
            });

            return {
                ...current,
                [treeType]: [...nodesByKey.values()],
            };
        });
    }

    private getNodeKey(node: TreeNode): string {
        return `${node.type}:${node.nodeName}`;
    }

    healthCheck(nodes: TreeNode[]): void {
        from(nodes)
            .pipe(mergeMap((node) => this.checkNodeHealth(node), 5))
            .subscribe();
    }

    checkNodeHealth(node: TreeNode) {
        return this.resourcesDataService.resourceCheck(node.type, node.resource.resource).pipe(
            tap((response) => {
                node.issuesCount.set(response.length);

                node.healthStatus.set(response.length > 0 ? NodeHealthStatus.ISSUES : NodeHealthStatus.OK);
            }),
            catchError(() => {
                node.healthStatus.set(NodeHealthStatus.FAILED);

                return of(null);
            }),
        );
    }

    reset(): void {
        this.nodes.set({});
    }

    refreshAll(): void {
        this.resourcesDataService.clearResourceCheckCache();
        [ObjectTypesEnum.INETNUM, ObjectTypesEnum.INET6NUM, ObjectTypesEnum.AUT_NUM].forEach((type) => this.refresh(type));
    }

    refresh(treeType: string): void {
        const nodes = this.nodes()[treeType] ?? [];

        // Reset status while checking
        nodes.forEach((node) => {
            node.healthStatus.set(NodeHealthStatus.NOT_CHECKED);
            node.issuesCount.set(0);
        });

        this.healthCheck(nodes);
    }
}
