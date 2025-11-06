import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { AlertsService } from '../shared/alert/alerts.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { FindMaintainerService, IFindMaintainer } from './find-maintainer.service';
import { FmpErrorService } from './fmp-error.service';

@Component({
    selector: 'find-maintainer',
    templateUrl: './find-maintainer.component.html',
    standalone: true,
    imports: [FormsModule, MatButton, NgIf, NgFor],
})
export class FindMaintainerComponent implements OnInit {
    private findMaintainerService = inject(FindMaintainerService);
    private userInfoService = inject(UserInfoService);
    alertsService = inject(AlertsService);
    router = inject(Router);
    activatedRoute = inject(ActivatedRoute);
    private fmpErrorService = inject(FmpErrorService);

    public foundMaintainer: IFindMaintainer;
    public maintainerKey: string;

    public ngOnInit() {
        this.maintainerKey = this.activatedRoute.snapshot.queryParamMap.get('mntnerKey');
        this.checkLoggedIn();
    }

    public selectMaintainer(maintainerKey: string) {
        this.alertsService.clearAlertMessages();
        console.info('Search for mntner ' + maintainerKey);
        this.findMaintainerService.search(maintainerKey).subscribe({
            next: (result: IFindMaintainer) => {
                this.foundMaintainer = result;
                if (this.foundMaintainer.expired === false) {
                    this.alertsService.addGlobalWarning(
                        `There is already an open request to reset the password of this maintainer. Proceeding now will cancel the earlier request.`,
                    );
                }
            },
            error: (error: string) => {
                if (this.foundMaintainer) {
                    this.foundMaintainer.mntnerFound = false;
                }
                if (error === 'switchToManualResetProcess') {
                    this.switchToManualResetProcess(maintainerKey, false);
                } else {
                    this.alertsService.addGlobalError(error);
                }
            },
        });
    }

    public validateEmail() {
        const mntKey = this.foundMaintainer.maintainerKey;
        this.findMaintainerService.sendMail(mntKey).subscribe({
            next: () => {
                void this.router.navigate(['fmp/mailSent', this.foundMaintainer.email], { queryParams: { maintainerKey: mntKey } });
            },
            error: (error: any) => {
                console.error('Error validating email:' + JSON.stringify(error));
                if (this.fmpErrorService.isYourAccountBlockedError(error)) {
                    this.fmpErrorService.setGlobalAccountBlockedError();
                    return;
                }
                if (error.status !== 401 && error.status !== 403) {
                    if (_.isUndefined(error.data)) {
                        this.alertsService.addGlobalError('Error sending email');
                    } else if (error.data.match(/unable to send email/i)) {
                        this.alertsService.addGlobalError(error.data);
                    }
                    this.switchToManualResetProcess(mntKey, false);
                }
            },
        });
    }

    public switchToManualResetProcess(maintainerKey: string, voluntaryChoice: boolean = true) {
        console.info('Switch to voluntary manual');
        void this.router.navigate(['fmp/forgotMaintainerPassword'], {
            queryParams: {
                mntnerKey: maintainerKey,
                voluntary: voluntaryChoice,
            },
        });
    }

    public cancel() {
        window.history.back();
    }

    private checkLoggedIn() {
        this.userInfoService.getUserOrgsAndRoles().subscribe({
            next: (res) => res,
            error: () => {
                return this.router.navigate(['fmp/requireLogin']);
            },
        });
    }
}
