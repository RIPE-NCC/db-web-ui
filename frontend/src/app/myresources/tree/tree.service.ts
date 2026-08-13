import { Service, signal, WritableSignal } from '@angular/core';
import { IResourceScreenItem, IUsage } from 'src/app/myresources/resource-type.model';

/** Node with expandable and level information */
export interface TreeNode {
    resourceName: string;
    type: string;
    level: number;
    expandable: boolean;
    isLoading: WritableSignal<boolean>;
    children?: TreeNode[];
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Service()
export class DynamicDatabase {
    rootLevelNodes: IResourceScreenItem[];

    /** Initial data from database */
    initialData(): TreeNode[] {
        return this.rootLevelNodes.map((item) => this.createNode(item.resource, item.type, 0, this.isExpandable(item.status, item.usage)));
    }

    createNode(resourceName: string, type: string, level: number, expandable: boolean): TreeNode {
        return {
            resourceName,
            type,
            level,
            expandable,
            isLoading: signal(false),
            children: undefined,
        };
    }

    isExpandable(status: string, usage: IUsage): boolean {
        return status.includes('ALLOCATED') && usage?.used > 0;
    }
}
