import { Component, effect, inject, input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { ResourceCheck } from 'src/app/myresources/resource-type.model';
import { ResourcesDataService } from 'src/app/myresources/resources-data.service';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { NameFormatterComponent } from 'src/app/shared/name-formatter.component';
import { TreeNode } from './tree.component';

@Component({
    selector: 'node-preview',
    templateUrl: 'node-preview.component.html',
    styleUrl: 'node-preview.component.scss',
    imports: [NameFormatterComponent, MatButton],
})
export class NodePreviewComponent {
    router = inject(Router);
    resourcesDataService = inject(ResourcesDataService);

    readonly node = input<TreeNode | undefined>();
    readonly usedPercentage = (): number => {
        const usage = this.node()?.resource?.usage;

        if (!usage || usage.total === 0) {
            return 0;
        }

        return Math.round((usage.used * 100) / usage.total);
    };
    readonly tabType = input.required<string>(); // to distinguish which node preview should execute
    readonly announcementStatus = signal<string | undefined>(undefined);

    constructor() {
        effect(() => {
            const node = this.node();
            const tabType = this.tabType();

            if (node && node.type === tabType) {
                this.checkIfAnnounced(node);
            }
        });
    }

    navigateToDetailPage() {
        void this.router.navigateByUrl(`/myresources/detail/${this.node().type}/${this.node().nodeName}/false`);
    }

    checkIfAnnounced(node: TreeNode) {
        this.resourcesDataService.checkIsAnnounced(node.type, node.nodeName).subscribe({
            next: (response: ResourceCheck[]) => {
                this.announcementStatus.set(response.length === 0 ? 'Announced' : response[0].type);
            },
        });
    }

    protected readonly Math = Math;
    protected readonly ObjectTypesEnum = ObjectTypesEnum;
}
