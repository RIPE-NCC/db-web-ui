import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSuffix } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTreeModule } from '@angular/material/tree';
import { BannerComponent, BannerTypes } from 'src/app/banner/banner.component';
import { IMoreSpecificResource, IMoreSpecificsApiResult, MoreSpecificsService } from 'src/app/myresources/morespecifics/more-specifics.service';
import { IResourceScreenItem, IUsage } from 'src/app/myresources/resource-type.model';
import { NameFormatterComponent } from 'src/app/shared/name-formatter.component';

export interface TreeNode {
    resource: string;
    netname: string;
    type: string;
    used: number;
    level: number;
    expandable: boolean;

    children?: TreeNode[];
    allChildren?: TreeNode[];

    showAllChildren?: boolean;

    // Only used by the "Show more" pseudo-node
    isShowMore?: boolean;
    isScalabilityBanner?: boolean;
    remaining?: number;
    parent?: TreeNode;

    isLoading: WritableSignal<boolean>;
}

@Component({
    selector: 'tree',
    templateUrl: 'tree.component.html',
    styleUrl: 'tree.component.scss',
    imports: [MatTreeModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSuffix, NameFormatterComponent, BannerComponent],
})
export class Tree implements OnInit {
    private moreSpecificsService = inject(MoreSpecificsService);
    dataSource = signal<TreeNode[]>([]);
    readonly childrenAccessor = (node: TreeNode) => node.children ?? [];
    readonly hasChild = (_: number, node: TreeNode) => !node.isShowMore && node.expandable;
    readonly isShowMore = (_: number, node: TreeNode): boolean => node.isShowMore === true;
    readonly isScalabilityBanner = (_: number, node: TreeNode): boolean => node.isScalabilityBanner === true;

    readonly scalabilityMsg = 'Nodes with 10+ children show first 10 items. Click "Show more" to expand the full list.';
    @Input()
    rootLevelNodes: IResourceScreenItem[];

    ngOnInit(): void {
        this.dataSource.set(this.initialData());
    }

    /** Initial data from database */
    initialData(): TreeNode[] {
        return this.rootLevelNodes.map((item) => this.createNode(item, 0, this.isExpandable(item.status, item.usage)));
    }

    createNode(resource: IResourceScreenItem | IMoreSpecificResource, level: number, expandable: boolean): TreeNode {
        return {
            resource: resource.resource,
            type: resource.type,
            netname: resource.netname,
            used: Math.round((resource.usage.used * 100) / resource.usage.total),
            level,
            expandable,
            isLoading: signal(false),
            children: undefined,
        };
    }

    isExpandable(status: string, usage: IUsage): boolean {
        return status.includes('ALLOCATED') && usage?.used > 0;
    }

    /**
     * Load children on node expansion.
     * Called from template via (expandedChange) output.
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

        if (node.children) {
            // Already loaded, don't reload from API
            return;
        }

        node.isLoading.set(true);

        this.moreSpecificsService.getSpecifics(node.resource, node.type).subscribe({
            next: (response: IMoreSpecificsApiResult) => {
                if (!response.resources) {
                    return;
                }

                node.allChildren = response.resources.map((resource) =>
                    this.createNode(resource, node.level + 1, this.isExpandable(resource.status, resource.usage)),
                );
                node.children = this.getVisibleChildren(node);
                this.dataSource.set([...this.dataSource()]);
            },
            error: () => {
                //
            },
            complete: () => {
                node.isLoading.set(false);
            },
        });
    }

    private getVisibleChildren(node: TreeNode): TreeNode[] {
        const children = node.allChildren ?? [];

        if (node.showAllChildren || children.length <= 10) {
            return children;
        }

        return [
            {
                isScalabilityBanner: true,
                parent: node,
            } as TreeNode,
            ...children.slice(0, 10),
            {
                isShowMore: true,
                remaining: children.length - 10,
                parent: node,
            } as TreeNode,
        ];
    }

    showMore(node: TreeNode): void {
        if (!node.parent) {
            return;
        }

        node.parent.showAllChildren = true;
        node.parent.children = this.getVisibleChildren(node.parent);

        this.dataSource.set([...this.dataSource()]);
    }

    protected readonly BannerTypes = BannerTypes;
}
