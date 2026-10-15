import { Component, effect, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSuffix } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTreeModule } from '@angular/material/tree';
import { BannerComponent, BannerTypes } from 'src/app/banner/banner.component';
import { NodeHealthService } from 'src/app/myresources/health-check-card/node-health.service';
import { IpAddressService } from 'src/app/myresources/ip-address.service';
import { IMoreSpecificResource, IMoreSpecificsApiResult, MoreSpecificsService } from 'src/app/myresources/morespecifics/more-specifics.service';
import { IResourceScreenItem, IUsage } from 'src/app/myresources/resource-type.model';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { HealthCheckableNode, NodeHealthStatus } from '../health-check-card/node-health.model';

export interface TreeNode extends HealthCheckableNode {
    parentResource: TreeNode;
    resource: IResourceScreenItem | IMoreSpecificResource;
    netname: string;
    level: number;
    expandable: boolean;

    children?: TreeNode[];
    allChildren?: TreeNode[];
    numberOfChildren?: number;

    showAllChildren?: boolean;

    // Only used by the "Show more" pseudo-node
    isShowMore?: boolean;
    remaining?: number;
    showMoreParent?: TreeNode;
}

@Component({
    selector: 'tree',
    templateUrl: 'tree.component.html',
    styleUrl: 'tree.component.scss',
    imports: [MatTreeModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSuffix, BannerComponent],
})
export class Tree {
    private moreSpecificsService = inject(MoreSpecificsService);
    private nodeHealthService = inject(NodeHealthService);

    dataSource = signal<TreeNode[]>([]);

    rootLevelNodes = input<IResourceScreenItem[]>([]);
    treeType = input<string>();

    readonly childrenAccessor = (node: TreeNode) => node.children ?? [];
    readonly hasChild = (_: number, node: TreeNode) => !node.isShowMore && node.expandable;
    readonly isShowMore = (_: number, node: TreeNode): boolean => node.isShowMore === true;

    readonly scalabilityMsg = 'Nodes with 10+ children show first 10 items. Click "Show more" to expand the full list.';
    showScalabilityBanner = false;

    nodeSelected = output<TreeNode>();
    selectedNode: TreeNode;

    constructor() {
        effect(() => {
            const resources = this.rootLevelNodes();
            const type = this.treeType();

            const nodes = resources.map((item) => this.createNode(item, 0, this.isExpandable(item.status, item.usage)));

            this.dataSource.set(nodes);

            this.nodeHealthService.registerNodes(type, nodes);
            this.nodeHealthService.healthCheck(nodes);
        });
    }

    createNode(resource: IResourceScreenItem | IMoreSpecificResource, level: number, expandable: boolean, parentNode?: TreeNode): TreeNode {
        return {
            parentResource: parentNode,
            resource: resource,
            nodeName: IpAddressService.rangeToSlash(resource.resource),
            type: resource.type,
            netname: resource.netname || ('asname' in resource ? resource.asname : undefined),
            level,
            expandable,
            children: undefined,
            healthStatus: signal(NodeHealthStatus.NOT_CHECKED),
            resourceCheckStatus: signal(undefined),
            announcementStatus: signal(undefined),
            issuesCount: signal(0),
            issuesCountOfChildren: signal(0),
        };
    }

    isExpandable(status: string, usage: IUsage): boolean {
        return (status.includes('ALLOCATED') || status === 'LIR-PARTITIONED PA') && usage?.used > 0;
    }

    /**
     * Load children on node expansion.
     * Called from template via + (expandedChange) output.
     */
    onNodeExpanded(node: TreeNode, expanded: boolean): void {
        if (!expanded) {
            // Reset "Show more" state every time the node is collapsed
            node.showAllChildren = false;
            if (node.allChildren) {
                node.children = this.getVisibleChildren(node);
                this.dataSource.set([...this.dataSource()]);
            }
            return;
        }
        this.selectNode(node);
        this.loadChildren(node);
    }

    private loadChildren(node: TreeNode) {
        if (node.children) {
            // Already loaded, don't reload from API
            return;
        }

        this.moreSpecificsService.getSpecifics(node.nodeName, node.type).subscribe({
            next: (response: IMoreSpecificsApiResult) => {
                if (!response.resources) {
                    return;
                }
                node.numberOfChildren = response.totalNumberOfResources;
                node.allChildren = response.resources.map((resource) =>
                    this.createNode(resource, node.level + 1, this.isExpandable(resource.status, resource.usage), node),
                );
                node.children = this.getVisibleChildren(node);
                this.dataSource.set([...this.dataSource()]);

                this.nodeHealthService.registerNodes(this.treeType(), node.allChildren);

                this.nodeHealthService.healthCheck(node.allChildren);

                if (this.selectedNode === node) {
                    this.nodeSelected.emit(node);
                }
            },
            error: () => {
                //
            },
        });
    }

    private getVisibleChildren(node: TreeNode): TreeNode[] {
        const children = node.allChildren ?? [];

        if (node.showAllChildren || children.length <= 10) {
            return children;
        }

        this.showScalabilityBanner = true;

        return [
            ...children.slice(0, 10),
            {
                isShowMore: true,
                remaining: children.length - 10,
                showMoreParent: node,
            } as TreeNode,
        ];
    }

    showMore(node: TreeNode): void {
        if (!node.showMoreParent) {
            return;
        }

        node.showMoreParent.showAllChildren = true;
        node.showMoreParent.children = this.getVisibleChildren(node.showMoreParent);

        this.dataSource.set([...this.dataSource()]);
    }

    selectNode(node: TreeNode) {
        this.selectedNode = node;
        this.nodeSelected.emit(node);
    }

    protected readonly BannerTypes = BannerTypes;
    protected readonly ObjectTypesEnum = ObjectTypesEnum;
    protected readonly NodeHealthStatus = NodeHealthStatus;
}
