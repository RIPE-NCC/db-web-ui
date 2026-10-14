import { inject, Injectable, signal } from '@angular/core';
import { Address4, Address6 } from 'ip-address';
import { from, Observable, of, switchMap } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { AnnouncementOptions, RouteAnnouncementOptions } from 'src/app/myresources/tree/node-preview.component';
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

    checkAnnouncementStatus(node: TreeNode): Observable<AnnouncementOptions> {
        return this.resourcesDataService.checkAnnouncements(node.type, node.nodeName).pipe(
            map((response): AnnouncementOptions => {
                if (response.length === 0) {
                    return 'Unannounced';
                }

                if (node.type == ObjectTypesEnum.AUT_NUM) {
                    return 'Announced';
                }

                const isIPv4 = node.type === ObjectTypesEnum.INETNUM;

                const isFullyAnnounced = response.some(({ prefix }) => {
                    if (isIPv4) {
                        const resource = new Address4(node.nodeName);
                        const announcedPrefix = new Address4(prefix);

                        return resource.isInSubnet(announcedPrefix);
                    }

                    const resource = new Address6(node.nodeName);
                    const announcedPrefix = new Address6(prefix);

                    return resource.isInSubnet(announcedPrefix);
                });

                if (isFullyAnnounced) {
                    return 'Announced';
                }

                return 'Partially announced';
            }),
            catchError((): Observable<AnnouncementOptions> => of('check failed')),
        );
    }

    checkRouteAnnouncementStatus(type: string, routePrefix: string, routeOrigin: string): Observable<RouteAnnouncementOptions> {
        const resource = type === ObjectTypesEnum.AUT_NUM ? routeOrigin : routePrefix;

        return this.resourcesDataService.checkAnnouncements(type, resource).pipe(
            map((response): RouteAnnouncementOptions => {
                if (response.length === 0) {
                    return 'Unannounced';
                }

                const isIPv4 = type === ObjectTypesEnum.INETNUM;
                const address = isIPv4 ? new Address4(routePrefix) : new Address6(routePrefix);

                const hasExactMatch = response.some(({ prefix, origin }) => {
                    const announcedAddress = isIPv4 ? new Address4(prefix) : new Address6(prefix);

                    return (
                        address.startAddress().correctForm() === announcedAddress.startAddress().correctForm() &&
                        address.subnetMask === announcedAddress.subnetMask &&
                        `AS${origin}` === routeOrigin
                    );
                });

                if (hasExactMatch) {
                    return 'Announced';
                }

                const hasOriginMismatch = response.some(({ prefix, origin }) => {
                    const announcedAddress = isIPv4 ? new Address4(prefix) : new Address6(prefix);

                    return (
                        address.startAddress().correctForm() === announcedAddress.startAddress().correctForm() &&
                        address.subnetMask === announcedAddress.subnetMask &&
                        origin !== routeOrigin
                    );
                });

                if (hasOriginMismatch) {
                    return 'Mismatch';
                }

                return 'Not exact match';
            }),
            catchError((): Observable<RouteAnnouncementOptions> => of('check failed')),
        );
    }

    healthCheck(nodes: TreeNode[]): void {
        from(nodes)
            .pipe(mergeMap((node) => this.checkNodeHealth(node), 5))
            .subscribe();
    }

    checkNodeHealth(node: TreeNode) {
        // for child node - more specific
        if (node.level > 0) {
            return this.checkAnnouncementStatus(node).pipe(
                tap((announcementStatus) => {
                    node.announcementStatus.set(announcementStatus);
                }),
            );
        }
        // for parent node
        return this.resourcesDataService.resourceCheck(node.type, node.resource.resource).pipe(
            switchMap((response) =>
                this.checkAnnouncementStatus(node).pipe(
                    tap((announcementStatus) => {
                        const issuesCount = response.length;
                        node.issuesCount.set(issuesCount);

                        node.healthStatus.set(issuesCount > 0 ? NodeHealthStatus.ISSUES : NodeHealthStatus.OK);
                        node.resourceCheckStatus.set(response);
                        node.announcementStatus.set(announcementStatus);
                    }),
                ),
            ),
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
