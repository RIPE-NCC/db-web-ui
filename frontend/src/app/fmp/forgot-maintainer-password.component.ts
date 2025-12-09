import { UpperCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '../shared/alert/alerts.service';
import { UserInfoService } from '../userinfo/user-info.service';
import { FmpErrorService } from './fmp-error.service';
import { ForgotMaintainerPasswordService, IForgotMaintainerPassword } from './forgot-maintainer-password.service';

@Component({
    selector: 'fmp',
    templateUrl: './forgot-maintainer-password.component.html',
    standalone: true,
    imports: [FormsModule, MatButton, UpperCasePipe],
})
export class ForgotMaintainerPasswordComponent implements OnInit, OnDestroy {
    private forgotMaintainerPasswordService = inject(ForgotMaintainerPasswordService);
    private userInfoService = inject(UserInfoService);
    private alertsService = inject(AlertsService);
    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private fmpErrorService = inject(FmpErrorService);

    public generatedPDFUrl: string;
    public fmpModel: IForgotMaintainerPassword;

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
