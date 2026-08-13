import { Component, inject, Input, OnInit, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSuffix } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTreeModule } from '@angular/material/tree';
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
    isLoading: WritableSignal<boolean>;
    children?: TreeNode[];
}

@Component({
    selector: 'tree',
    templateUrl: 'tree.component.html',
    styleUrl: 'tree.component.scss',
    imports: [MatTreeModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSuffix, NameFormatterComponent],
})
export class Tree implements OnInit {
    private moreSpecificsService = inject(MoreSpecificsService);
    dataSource = signal<TreeNode[]>([]);
    readonly childrenAccessor = (node: TreeNode) => node.children ?? [];
    readonly hasChild = (_: number, node: TreeNode) => node.expandable;

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
        if (!expanded || node.children) {
            // Don't reload if collapsing or already loaded
            return;
        }

        node.isLoading.set(true);

        this.moreSpecificsService.getSpecifics(node.resource, node.type).subscribe({
            next: (response: IMoreSpecificsApiResult) => {
                if (!response.resources) {
                    return;
                }

                node.children = response.resources.map((resource) =>
                    this.createNode(resource, node.level + 1, this.isExpandable(resource.status, resource.usage)),
                );
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
}
