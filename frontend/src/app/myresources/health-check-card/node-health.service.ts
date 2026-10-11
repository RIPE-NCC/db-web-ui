import { inject, Injectable, signal } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ResourceCheckType } from 'src/app/myresources/tree/node-preview.component';
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

    checkAnnouncementStatus(node: TreeNode): Observable<ResourceCheckType> {
        return this.resourcesDataService.checkAnnouncements(node.type, node.nodeName).pipe(
            map((response): ResourceCheckType => (response.length > 0 ? 'Announced' : 'Unannounced')),
            catchError((): Observable<ResourceCheckType> => of('check failed')),
        );
    }

    checkNodeHealth(node: TreeNode) {
        // for child node - more specific
        if (node.parentResource) {
            return this.checkAnnouncementStatus(node).pipe(
                tap((announcementStatus) => {
                    node.announcementStatus.set(announcementStatus);

                    node.issuesCount.set(announcementStatus === 'Announced' ? 0 : 1);
                    node.healthStatus.set(announcementStatus === 'Announced' ? NodeHealthStatus.OK : NodeHealthStatus.ISSUES);
                }),
            );
        }
        // for parent node
        return this.resourcesDataService.resourceCheck(node.type, node.resource.resource).pipe(
            tap((response) => {
                node.issuesCount.set(response.length);

                node.healthStatus.set(response.length > 0 ? NodeHealthStatus.ISSUES : NodeHealthStatus.OK);
                node.announcementStatus.set(response.length > 0 ? (response[0].type as ResourceCheckType) : 'Announced');
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
        this.resourcesDataService.clearAnnouncementsCache();
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
