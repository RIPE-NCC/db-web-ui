import { Component, effect, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AssociatedObjectsService, AssociatedObjectType, IAssociatedObjectApiResult } from 'src/app/myresources/associatedobjects/associated-objects.service';
import { ResourceCheck } from 'src/app/myresources/resource-type.model';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { PropertiesService } from 'src/app/properties.service';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { NameFormatterComponent } from 'src/app/shared/name-formatter.component';
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
    imports: [NameFormatterComponent, MatButton, MatProgressSpinner, RouterLink],
})
export class NodePreviewComponent {
    router = inject(Router);
    properties = inject(PropertiesService);
    resourcesDataService = inject(ResourcesDataService);
    associatedObjectService = inject(AssociatedObjectsService);

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
    readonly hasAssociatedRouteObjects = signal<string | undefined>(undefined);
    readonly hasAssociatedDomainObjects = signal<string | undefined>(undefined);
    readonly checkingDatabaseObjects = signal<boolean>(false);
    readonly checkingRoutingInformation = signal<boolean>(false);

    constructor() {
        effect(() => {
            const node = this.node();
            const tabType = this.tabType();

            if (node && node.type === tabType) {
                this.checkIfAnnounced(node);
                this.checkIfAssociatedRouteObjects(node);
                this.checkIfAssociatedDomainObjects(node);
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
            .resourceCheck(node.type, node.nodeName)
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
                    this.hasAssociatedRouteObjects.set(response.associatedObjects.length > 0 ? 'Present' : '-');
                },
                error: () => {
                    this.hasAssociatedRouteObjects.set('check failed');
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
                    this.hasAssociatedDomainObjects.set(response.associatedObjects.length > 0 ? 'Present' : '-');
                },
                error: () => {
                    this.hasAssociatedDomainObjects.set('check failed');
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

    protected readonly Math = Math;
    protected readonly ObjectTypesEnum = ObjectTypesEnum;
}
