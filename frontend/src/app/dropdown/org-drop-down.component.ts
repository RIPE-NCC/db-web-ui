import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { PropertiesService } from '../properties.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { IUserInfoOrganisation, IUserInfoResponseData } from './org-data-type.model';
import { OrgDropDownSharedService } from './org-drop-down-shared.service';

@Component({
    selector: 'org-drop-down',
    templateUrl: './org-drop-down.component.html',
})
export class OrgDropDownComponent implements OnInit {
    public selectedOrg: IUserInfoOrganisation;
    public organisations: IUserInfoOrganisation[] = [];
    // Temporary until we need different application on Test, Training and RC environment
    public trainingEnv: boolean;

    constructor(private userInfoService: UserInfoService, private orgDropDownSharedService: OrgDropDownSharedService, private properties: PropertiesService) {
        this.userInfoService.userLoggedIn$.subscribe((userInfo: IUserInfoResponseData) => {
            this.initOrgsAndMemebers(userInfo);
        });
    }

    public ngOnInit() {
        this.trainingEnv = this.properties.isTrainingEnv();
        this.userInfoService.getUserOrgsAndRoles().subscribe(
            (userInfo: IUserInfoResponseData): void => {
                if (!userInfo) {
                    return;
                }
                this.initOrgsAndMemebers(userInfo);
            },
            (err: Error): void => {
                console.warn('err', err);
                return;
            },
        );
    }

    public organisationSelected(event: any): void {
        this.selectedOrg = event;
        this.orgDropDownSharedService.setSelectedOrg(event);
        this.userInfoService.setSelectedOrganisation(this.selectedOrg);
    }

    public customSearchFn(term: string, item: any) {
        term = term.toLocaleLowerCase();
        return (
            item.organisationName.toLocaleLowerCase().includes(term) ||
            (item.regId && item.regId.toLocaleLowerCase().includes(term)) ||
            (!item.regId && item.orgObjectId && item.orgObjectId.toLocaleLowerCase().includes(term))
        );
    }

    private sortOrganisations(orgs: IUserInfoOrganisation[]): IUserInfoOrganisation[] {
        return orgs.sort((o1, o2) => {
            return o1.organisationName.localeCompare(o2.organisationName);
        });
    }

    private initOrgsAndMemebers(userInfo: IUserInfoResponseData) {
        const orgs: IUserInfoOrganisation[] = [];
        const members: IUserInfoOrganisation[] = [];
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
        this.userInfoService.getSelectedOrganisation().subscribe((org: IUserInfoOrganisation) => {
            if (this.selectedOrg !== org) {
                this.orgDropDownSharedService.setSelectedOrg(org);
                this.userInfoService.setSelectedOrganisation(org);
                this.selectedOrg = org;
            }
        });
    }
}
