import {Component} from "@angular/core";
import {EnvironmentStatusService} from "../shared/environment-status.service";
import {OrgDropDownSharedService} from "./org-drop-down-shared.service";
import {IUserInfoOrganisation, IUserInfoResponseData} from "./org-data-type.model";
import {UserInfoService} from "../userinfo/user-info.service";

@Component({
    selector: "org-drop-down",
    templateUrl: "./org-drop-down.component.html",
})
export class OrgDropDownComponent {

    public selectedOrg: IUserInfoOrganisation;
    public organisations: IUserInfoOrganisation[] = [];
    // Temporary until we need different application on Test, Training and RC environment
    public trainingEnv: boolean;

    constructor(private userInfoService: UserInfoService,
                private environmentStatus: EnvironmentStatusService,
                private orgDropDownSharedService: OrgDropDownSharedService) {
    }

    public ngOnInit() {
        this.trainingEnv = this.environmentStatus.isTrainingEnv();
        const orgs: IUserInfoOrganisation[] = [];
        const members: IUserInfoOrganisation[] = [];
        this.userInfoService.getUserOrgsAndRoles()
            .subscribe((userInfo: IUserInfoResponseData): void => {
                if (!userInfo) {
                    return;
                }
                if (_.isArray(userInfo.organisations)) {
                    for (const org of userInfo.organisations) {
                        orgs.push(org);
                    }
                    this.sortOrganisations(orgs);
                }
                if (_.isArray(userInfo.members)) {
                    for (const org of userInfo.members) {
                        members.push(org);
                    }
                    this.sortOrganisations(members);
                }
                this.organisations = members.concat(orgs);
                this.userInfoService.getSelectedOrganisation()
                    .subscribe((org: IUserInfoOrganisation) => {
                        if (this.selectedOrg !== org) {
                            this.orgDropDownSharedService.setSelectedOrg(org);
                            this.userInfoService.setSelectedOrganisation(org);
                            this.selectedOrg = org;
                        }
                    });
            }, (err: Error): void => {
                console.warn("err", err);
                return null;
            });
    }

    public organisationSelected(event: any): void {
        this.selectedOrg = event;
        this.orgDropDownSharedService.setSelectedOrg(event);
        this.userInfoService.setSelectedOrganisation(this.selectedOrg);
    }

    public customSearchFn(term: string, item: any) {
        term = term.toLocaleLowerCase();
        return item.organisationName.toLocaleLowerCase().indexOf(term) > -1 ||
            (item.regId && item.regId.toLocaleLowerCase().indexOf(term) > -1) ||
            (item.orgObjectId && item.orgObjectId.toLocaleLowerCase().indexOf(term) > -1);
    }

    private sortOrganisations(orgs: IUserInfoOrganisation[]): IUserInfoOrganisation[] {
        return orgs.sort((o1, o2) => {
            return o1.organisationName.localeCompare(o2.organisationName);
        });
    }
}
