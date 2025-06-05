import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '../shared/alert/alerts.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { FmpErrorService } from './fmp-error.service';
import { ForgotMaintainerPasswordService, IForgotMaintainerPassword } from './forgot-maintainer-password.service';

@Component({
    selector: 'fmp',
    templateUrl: './forgot-maintainer-password.component.html',
    standalone: false,
})
export class ForgotMaintainerPasswordComponent implements OnInit, OnDestroy {
    public generatedPDFUrl: string;
    public fmpModel: IForgotMaintainerPassword;

    constructor(
        private forgotMaintainerPasswordService: ForgotMaintainerPasswordService,
        private userInfoService: UserInfoService,
        private alertsService: AlertsService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private fmpErrorService: FmpErrorService,
    ) {}

    public ngOnInit() {
        this.generatedPDFUrl = '';
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.fmpModel = {
            email: '',
            mntnerKey: queryParamMap.get('mntnerKey'),
            reason: '',
            voluntary: queryParamMap.has('voluntary'),
        };
        this.checkLoggedIn();
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
    }

    public next(fmp: IForgotMaintainerPassword, formValid: boolean) {
        if (formValid) {
            console.info('Form is valid, sending data to server.');
            this.forgotMaintainerPasswordService.generatePdfAndEmail(fmp).subscribe({
                next: (pdfUrl: string) => {
                    this.generatedPDFUrl = pdfUrl;
                    this.alertsService.setGlobalSuccess('Success!');
                },
                error: (error) => {
                    if (this.fmpErrorService.isYourAccountBlockedError(error)) {
                        this.fmpErrorService.setGlobalAccountBlockedError();
                    }
                },
            });
        }
    }

    private checkLoggedIn() {
        this.userInfoService.getUserOrgsAndRoles().subscribe({
            next: (res) => res,
            error: () => {
                return this.router.navigate(['requireLogin'], {
                    queryParams: {
                        mntnerKey: this.fmpModel.mntnerKey,
                        voluntary: this.fmpModel.voluntary,
                    },
                });
            },
        });
    }
}
