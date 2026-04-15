import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { KeyType } from '../apikeys/utils';
import { IUserInfoOrganisation, IUserInfoRegistration } from '../dropdown/org-data-type.model';
import { OrgDropDownSharedService } from '../dropdown/org-drop-down-shared.service';
import { ApikeysDropdownComponent } from '../myresources/apikeys-dropdown/apikeys-dropdown.component';
import { ManageResourcesComponent } from '../myresources/manage-resources/manage-resources.component';
import { RefreshComponent } from '../myresources/refresh/refresh.component';
import { AlertsService } from '../shared/alert/alerts.service';
import { LabelPipe } from '../shared/label.pipe';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { IpAnalyserService } from './ip-analyser.service';

@Component({
    selector: 'ip-analyser',
    templateUrl: './ip-analyser.component.html',
    styleUrl: './ip-analyser.component.scss',
    standalone: true,
    imports: [
        MatButton,
        LabelPipe,
        ApikeysDropdownComponent,
        ManageResourcesComponent,
        RefreshComponent,
        LoadingIndicatorComponent,
        CdkCopyToClipboard,
        MatTooltip,
    ],
})
export class IpAnalyserComponent implements OnInit, OnDestroy {
    private router = inject(Router);
    private orgDropDownSharedService = inject(OrgDropDownSharedService);
    private ipAnalyserService = inject(IpAnalyserService);
    private alertService = inject(AlertsService);

    ipv4Analysis: string;
    ipv6Analysis: string;
    loading: boolean = true;
    private organisation: IUserInfoOrganisation;

    private subscription?: Subscription;

    constructor() {
        this.orgDropDownSharedService.selectedOrgChanged$.subscribe((selected: IUserInfoOrganisation) => {
            if (!selected || !selected.roles || selected.roles.length < 1) {
                return;
            }
            this.organisation = selected;
            this.showPageJustToMemberOrg();
        });
    }

    ngOnInit(): void {
        this.organisation = this.orgDropDownSharedService.getSelectedOrg();
        this.showPageJustToMemberOrg();
    }

    ngOnDestroy() {
        this.alertService.clearAlertMessages();
        this.subscription?.unsubscribe();
    }

    showPageJustToMemberOrg() {
        if (this.isMemberOrg()) {
            this.getIpAnalysis();
        } else {
            // redirect to my resources page
            void this.router.navigate(['myresources/overview']);
        }
    }

    getIpAnalysis() {
        this.subscription?.unsubscribe();
        this.ipv4Analysis = undefined;
        this.ipv6Analysis = undefined;
        this.loading = true;
        this.alertService.clearAlertMessages();
        const getIpv4Analysis = this.ipAnalyserService.getIpv4Analysis(this.organisation.orgObjectId);
        const getIpv6Analysis = this.ipAnalyserService.getIpv6Analysis(this.organisation.orgObjectId);
        this.subscription = forkJoin([getIpv4Analysis, getIpv6Analysis]).subscribe({
            next: (response) => {
                this.ipv4Analysis = response[0];
                this.ipv6Analysis = response[1];
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                const errJson = JSON.parse(err.error);
                this.alertService.addGlobalError(errJson?.errormessages?.errormessage?.[0]?.text);
            },
        });
    }

    isMemberOrg(): boolean {
        return !!this.organisation && !!(this.organisation as IUserInfoRegistration).membershipId;
    }

    protected readonly KeyType = KeyType;
}
