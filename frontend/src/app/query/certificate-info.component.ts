import { NgIf } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';

@Component({
    selector: 'certificate-info',
    templateUrl: './certificate-info.component.html',
    imports: [NgIf],
})
export class CertificateInfoComponent implements OnDestroy {
    private cookies = inject(CookieService);
    private orgDropDownSharedService = inject(OrgDropDownSharedService);

    public member: boolean;
    public subscription: any;

    constructor() {
        this.subscription = this.orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            this.isMemberOrg(selected);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private isMemberOrg(selectedOrg: IUserInfoOrganisation) {
        if (selectedOrg) {
            this.member = selectedOrg.orgObjectId && selectedOrg.roles.indexOf('LIR') > -1;
        } else {
            this.member = false;
        }
    }
}
