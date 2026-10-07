import { Component, effect, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import {
    AssociatedObjectsService,
    AssociatedObjectType,
    IAssociatedDomainObject,
    IAssociatedObjectApiResult,
    IAssociatedRouteObject,
} from 'src/app/myresources/associatedobjects/associated-objects.service';
import { ResourceCheck } from 'src/app/myresources/resource-type.model';
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
    | 'check failed'
    | 'Announced';

@Component({
    selector: 'node-preview',
    templateUrl: 'node-preview.component.html',
    styleUrl: 'node-preview.component.scss',
    imports: [MatButton, MatProgressSpinner, RouterLink, NodeStatusWarningComponent],
})
export class NodePreviewComponent {
    router = inject(Router);
    properties = inject(PropertiesService);
    resourcesDataService = inject(ResourcesDataService);
    associatedObjectService = inject(AssociatedObjectsService);
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
    readonly announcementStatus = signal<ResourceCheckType | undefined>(undefined);
    readonly associatedRouteObjects = signal<IAssociatedRouteObject[] | undefined>(undefined);
    readonly associatedDomainObjects = signal<IAssociatedDomainObject[] | undefined>(undefined);
    readonly hasRoas = signal<string | undefined>(undefined);
    readonly originASNs = signal<string[] | undefined>(undefined);
    readonly checkingDatabaseObjects = signal<boolean>(false);
    readonly checkingRoutingInformation = signal<boolean>(false);

    //warning messages
    readonly announcedNoAssignmentsIpv4Description =
        'Register more specific IPv4 assignments or update the status of the allocation to \'Allocated Assigned PA\' if you are using the entire range. <a href="https://www.ripe.net/publications/docs/ripe-826/">Read more about the policy</a>';
    readonly announcedNoAssignmentsIpv6Description =
        "Register an inet6num object with status 'Assigned' for each network in use. Assingment size can be between /64 and /48. If you are using a pool of addresses you can register an inet6num object with status 'aggregated by LIR'. <a href=\"https://www.ripe.net/publications/docs/ripe-738/\">Read more about the policy</a>";
    readonly ipv6AssignmentToSmallDescription =
        'The minimum size of an IPv6 assingment is /64. Please delete and re-create. <a href="https://www.ripe.net/publications/docs/ripe-738/">Read more about the policy</a>';

    constructor() {
        effect(() => {
            const node = this.node();
            const tabType = this.tabType();

            if (node && node.type === tabType) {
                this.checkIfAnnounced(node);
                this.checkIfAssociatedRouteObjects(node);
                this.checkIfAssociatedDomainObjects(node);
                this.checkIfHaveRoas(node);
            }
        });
    }

    navigateToDetailPage(): void {
        void this.router.navigateByUrl(`/myresources/detail/${this.node().type}/${this.node().nodeName}/false`);
    }

    navigateToCreateAssignments() {
        void this.router.navigateByUrl(`/webupdates/create/${this.properties.SOURCE}/${this.node().type}`);
    }

    checkIfAnnounced(node: TreeNode) {
        this.checkingRoutingInformation.set(true);
        this.resourcesDataService
            .resourceCheck(node.type, node.resource.resource)
            .pipe(finalize(() => this.checkingRoutingInformation.set(false)))
            .subscribe({
                next: (response: ResourceCheck[]) => {
                    this.announcementStatus.set(response.length === 0 ? 'Announced' : (response[0].type as ResourceCheckType));
                },
                error: (_err) => {
                    this.announcementStatus.set('check failed');
                },
            });
    }

    checkIfAssociatedRouteObjects(node: TreeNode) {
        this.checkingDatabaseObjects.set(true);
        this.associatedObjectService
            .getAssociatedObjects(AssociatedObjectType.ASSOCIATED_ROUTE, node.nodeName, node.type, 0, '')
            .pipe(finalize(() => this.checkingDatabaseObjects.set(false)))
            .subscribe({
                next: (response: IAssociatedObjectApiResult) => {
                    this.associatedRouteObjects.set(response.associatedObjects as IAssociatedRouteObject[]);
                },
                // error: () => {
                //     this.associatedRouteObjects.set('check failed');
                // },
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
                },
                // error: () => {
                //     this.hasAssociatedDomainObjects.set('check failed');
                // },
            });
    }

    checkIfHaveRoas(node: TreeNode) {
        this.rpkiValidatorService.getRoas(node.resource.type, node.nodeName).subscribe({
            next: (response: string[]) => {
                this.hasRoas.set(response.length > 0 ? 'Present' : '-');
                this.originASNs.set(response.map((value) => value.substring(value.lastIndexOf('AS'))));
            },
            error: () => {
                this.hasRoas.set('check failed');
            },
        });
    }

    canHaveAssignments(): boolean {
        const statusesWithAssignments = ['ALLOCATED PA', 'SUB-ALLOCATED PA', 'LIR-PARTITIONED PA', 'ALLOCATED-BY-RIR', 'ALLOCATED-BY-LIR'];
        return statusesWithAssignments.includes(this.node().resource.status);
    }

    checkIfHaveAssignments() {
        return this.canHaveAssignments() && this.node().children?.length;
    }

    navigateToCreateRouteObject() {}

    protected readonly Math = Math;
    protected readonly ObjectTypesEnum = ObjectTypesEnum;
}
