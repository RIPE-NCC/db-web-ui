import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { IUserInfoOrganisation } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';

@Component({
    selector: 'certificate-banner',
    templateUrl: './certificate-banner.component.html',
})
export class CertificateBannerComponent implements OnInit {
    public closed: boolean;
    public member: boolean;
    public subscription: any;

    constructor(private cookies: CookieService, private orgDropDownSharedService: OrgDropDownSharedService) {
        this.subscription = this.orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            this.isMemberOrg(selected);
        });
    }

    public ngOnInit() {
        this.closed = localStorage.getItem('certificate-banner') === 'closed';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    public closeAlert() {
        const element = document.getElementsByClassName('alert')[0];
        element.parentNode.removeChild(element);
        localStorage.setItem('certificate-banner', 'closed');
    }

    private isMemberOrg(selectedOrg: IUserInfoOrganisation) {
        if (selectedOrg) {
            this.member = selectedOrg.orgObjectId && selectedOrg.roles.indexOf('LIR') > -1;
        } else {
            this.member = false;
        }
    }
}
