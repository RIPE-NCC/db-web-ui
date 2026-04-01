import { EventEmitter, Injectable } from '@angular/core';
import { IUserInfoOrganisation } from './org-data-type.model';

@Injectable({ providedIn: 'root' })
export class OrgDropDownSharedService {
    selectedOrgChanged$: EventEmitter<IUserInfoOrganisation>;
    private selectedOrg: IUserInfoOrganisation;

    constructor() {
        this.selectedOrgChanged$ = new EventEmitter();
    }

    setSelectedOrg(org: any): void {
        this.selectedOrg = org;
        this.selectedOrgChanged$.emit(org);
    }

    getSelectedOrg(): IUserInfoOrganisation {
        return this.selectedOrg;
    }
}
