import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { NameFormatterComponent } from '../../shared/name-formatter.component';
import { UserInfoService } from '../../userinfo/user-info.service';
import { IResourceModel } from '../resource-type.model';
import { HierarchySelectorService } from './hierarchy-selector.service';

@Component({
    selector: 'hierarchy-selector',
    templateUrl: './hierarchy-selector.component.html',
    imports: [NgbDropdown, NgbDropdownToggle, NgIf, NgbDropdownMenu, NgFor, NameFormatterComponent],
})
export class HierarchySelectorComponent implements OnChanges {
    private hierarchySelectorService = inject(HierarchySelectorService);
    private userInfoService = inject(UserInfoService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);

    public parents: string[];
    @Input()
    public resource: IResourceModel;

    public ngOnChanges() {
        if (!this.resource || ['inetnum', 'inet6num'].indexOf(this.resource.type) < 0) {
            return;
        }

        this.userInfoService.getSelectedOrganisation().subscribe((selOrg: any) => {
            if (selOrg && selOrg.orgObjectId) {
                this.fetchParents(selOrg.orgObjectId);
            }
        });
    }

    public showTopLevelResources() {
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const params = {
            ipanalyserRedirect: paramMap.get('ipanalyserRedirect'),
            sponsored: paramMap.get('sponsored'),
            type: this.resource.type,
        };
        void this.router.navigate(['myresources/overview'], { queryParams: params });
    }

    public takeMeBackHome(parent: string) {
        if (!parent && !(this.parents && this.parents.length)) {
            return this.showTopLevelResources();
        }
        const paramMap = this.activatedRoute.snapshot.paramMap;
        const target = parent ? parent : this.parents[this.parents.length - 1];
        const params = {
            ipanalyserRedirect: paramMap.get('ipanalyserRedirect'),
        };
        void this.router.navigate(['myresources/detail', this.resource.type, target, paramMap.get('sponsored')], { queryParams: params });
    }

    private fetchParents(orgId: string): void {
        this.hierarchySelectorService.fetchParentResources(this.resource, orgId).subscribe((resp: string[]) => {
            const parents: string[] = resp;
            this.parents = parents && parents.length < 1 ? [] : parents;
            this.parents.push(this.resource.resource);
        });
    }
}
