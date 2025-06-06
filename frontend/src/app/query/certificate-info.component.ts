import { Component, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';

@Component({
    selector: 'certificate-info',
    templateUrl: './certificate-info.component.html',
    standalone: false,
})
export class CertificateInfoComponent implements OnDestroy {
    public member: boolean;
    public subscription: any;

    constructor(private cookies: CookieService, private orgDropDownSharedService: OrgDropDownSharedService) {
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
