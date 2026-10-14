import { Component, effect, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import {
    AssociatedObjectsService,
    AssociatedObjectType,
    IAssociatedDomainObject,
    IAssociatedObjectApiResult,
    IAssociatedRouteObject,
} from 'src/app/myresources/associatedobjects/associated-objects.service';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { Announcement } from 'src/app/myresources/resource-type.model';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { NodeStatusWarningComponent } from 'src/app/myresources/tree/node-status-warning/node-status-warning.component';
import { PropertiesService } from 'src/app/properties.service';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { RpkiValidatorService } from 'src/app/updatesweb/rpki-validator.service';
import { TreeNode } from './tree.component';

export type ResourceCheckType =
    | 'ANNOUNCED_NO_ASSIGNMENTS'
    | 'NOT_ANNOUNCED_WITH_ASSIGNMENTS'
    | 'UNANNOUNCED_ASN'
    | 'IPV6_ASSIGNMENT_TOO_SMALL'
    | 'check failed';

export type AnnouncementOptions = 'Announced' | 'Partially announced' | 'Unannounced' | 'check failed';
export type RouteAnnouncementOptions = 'Announced' | 'Not exact match' | 'Mismatch' | 'Unannounced' | 'check failed';

@Component({
    selector: 'node-preview',
    templateUrl: 'node-preview.component.html',
    styleUrl: 'node-preview.component.scss',
    imports: [MatButton, MatProgressSpinner, RouterLink, NodeStatusWarningComponent, MatTooltip],
})
export class NodePreviewComponent {
    router = inject(Router);
    properties = inject(PropertiesService);
    associatedObjectService = inject(AssociatedObjectsService);
    nodeHealthService = inject(NodeHealthService);
    resourcesDataService = inject(ResourcesDataService);
    rpkiValidatorService = inject(RpkiValidatorService);

    readonly node = input<TreeNode | undefined>();
    readonly usedPercentage = (): number => {
        const usage = this.node()?.resource?.usage;

        if (!usage || usage.total === 0) {
            return 0;
        }

        return Math.round((usage.used * 100) / usage.total);
    };
    readonly tabType = input.required<string>(); // to distinguish which node preview should execute
    readonly associatedRouteObjects = signal<IAssociatedRouteObject[] | undefined>(undefined);
    readonly associatedRouteObjectsCheckFailed = signal(false);
    readonly associatedDomainObjects = signal<IAssociatedDomainObject[] | undefined>(undefined);
    readonly associatedDomainObjectsCheckFailed = signal(false);
    readonly hasRoas = signal<string | undefined>(undefined);
    readonly originASNs = signal<string[] | undefined>(undefined);
    readonly checkingDatabaseObjects = signal<boolean>(false);
    readonly checkingRoutingInformation = signal<boolean>(false);

    readonly allAssignmentsKinds = ['ASSIGNED PA', 'ASSIGNED PI'];

    //warning messages
    readonly announcedNoAssignmentsIpv4Description =
        'Register more-specific IPv4 assignments, or if all addresses in an allocation are used for infrastructure, you may update its status to ALLOCATED-ASSIGNED PA.';
    readonly announcedNoAssignmentsIpv6Description =
        "Register an inet6num object with status 'ASSIGNED' for each network in use. Assingment size can be between /64 and /48. If you are using a large pool of addresses you can register an inet6num object with status 'aggregated by LIR'";
    readonly ipv6AssignmentToSmallDescription = 'The minimum size of an IPv6 assingment is /64. Please delete and re-create.';

    constructor() {
        effect(() => {
            const node = this.node();
            const tabType = this.tabType();

            if (node && node.type === tabType) {
                this.checkIfAssociatedRouteObjects(node);
                this.checkIfAssociatedDomainObjects(node);
                this.checkIfHaveRoas(node);
                this.checkOriginAsns(node);
            }
        });
    }

    hasResourceCheck(type: ResourceCheckType): boolean {
        return this.node()
            .resourceCheckStatus()
            ?.some((check) => check.type === type);
    }

    navigateToDetailPage(): void {
        void this.router.navigateByUrl(`/myresources/detail/${this.node().type}/${this.node().nodeName}/false`);
    }

    navigateToCreateAssignments() {
        void this.router.navigateByUrl(`/webupdates/create/${this.properties.SOURCE}/${this.node().type}`);
    }

    checkIfAssociatedRouteObjects(node: TreeNode) {
        this.checkingDatabaseObjects.set(true);
        this.associatedObjectService
            .getAssociatedObjects(AssociatedObjectType.ASSOCIATED_ROUTE, node.nodeName, node.type, 0, '')
            .pipe(finalize(() => this.checkingDatabaseObjects.set(false)))
            .subscribe({
                next: (response: IAssociatedObjectApiResult) => {
                    const routes = (response.associatedObjects as IAssociatedRouteObject[]).reverse();

                    if (routes.length === 0) {
                        this.associatedRouteObjects.set([]);
                        this.associatedRouteObjectsCheckFailed.set(false);
                        return;
                    }

                    forkJoin(
                        routes.map((route) =>
                            this.nodeHealthService.checkRouteAnnouncementStatus(node.type, route.prefix, route.origin).pipe(
                                map((announcementStatus) => ({
                                    ...route,
                                    announcementStatus,
                                })),
                            ),
                        ),
                    ).subscribe((routesWithStatus) => {
                        this.associatedRouteObjects.set(routesWithStatus);
                        this.associatedRouteObjectsCheckFailed.set(false);
                    });
                },
                error: () => {
                    this.associatedRouteObjectsCheckFailed.set(true);
                },
            });
    }

    checkIfAssociatedDomainObjects(node: TreeNode) {
        this.checkingDatabaseObjects.set(true);
        this.associatedObjectService
            .getAssociatedObjects(AssociatedObjectType.ASSOCIATED_DOMAIN, node.nodeName, node.type, 0, '')
            .pipe(finalize(() => this.checkingDatabaseObjects.set(false)))
            .subscribe({
                next: (response: IAssociatedObjectApiResult) => {
                    this.associatedDomainObjects.set(response.associatedObjects as IAssociatedDomainObject[]);
                    this.associatedDomainObjectsCheckFailed.set(false);
                },
                error: () => {
                    this.associatedDomainObjectsCheckFailed.set(true);
                },
            });
    }

    checkOriginAsns(node: TreeNode) {
        this.resourcesDataService.checkAnnouncements(node.type, node.nodeName).subscribe({
            next: (response: Announcement[]) => {
                this.originASNs.set([...new Set(response.map((announcement) => `AS${announcement.origin}`))]);
            },
        });
    }

    checkIfHaveRoas(node: TreeNode) {
        this.rpkiValidatorService.getRoas(node.resource.type, node.nodeName).subscribe({
            next: (response: string[]) => {
                this.hasRoas.set(response.length > 0 ? 'Present' : '—');
            },
            error: () => {
                this.hasRoas.set('check failed');
            },
        });
    }

    protected readonly Math = Math;
    protected readonly ObjectTypesEnum = ObjectTypesEnum;
    protected readonly PropertiesService = PropertiesService;
}
