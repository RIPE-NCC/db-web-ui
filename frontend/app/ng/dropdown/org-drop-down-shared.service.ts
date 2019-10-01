import {EventEmitter, Injectable} from "@angular/core";
import {IUserInfoOrganisation} from "./org-data-type.model";

@Injectable()
export class OrgDropDownSharedService {
    public selectedOrgChanged$: EventEmitter<IUserInfoOrganisation>;
    private selectedOrg: IUserInfoOrganisation;

    constructor() {
        this.selectedOrgChanged$ = new EventEmitter();
    }

    public setSelectedOrg(org: any): void {
        this.selectedOrg = org;
        this.selectedOrgChanged$.emit(org);
    }
}
