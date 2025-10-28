import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AlertsService } from '../shared/alert/alerts.service';
import { EmailLinkService } from './email-link.services';
import { FmpErrorService } from './fmp-error.service';

@Component({
    selector: 'confirm-maintainer',
    templateUrl: './confirm-maintainer.component.html',
    imports: [NgIf, MatButton],
})
export class ConfirmMaintainerComponent implements OnInit {
    private emailLinkService = inject(EmailLinkService);
    alertsService = inject(AlertsService);
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);
    fmpErrorService = inject(FmpErrorService);

    public key: string = '';
    public email: any;
    public user: any;
    public hashOk: boolean = false;
    public localHash: any;

    public ngOnInit() {
        this.alertsService.clearAlertMessages();
        console.info('ConfirmMaintainer starts');
        const queryParams = this.activatedRoute.snapshot.queryParams;
        if (!queryParams.hash) {
            this.alertsService.setGlobalError('No hash passed along');
            return;
        }

        this.localHash = queryParams.hash;
        this.emailLinkService.get(this.localHash).subscribe({
            next: (link: any) => {
                console.info('Successfully fetched email-link:' + JSON.stringify(link));
                this.key = link.mntner;
                this.email = link.email;
                this.user = link.username;

                if (!link.hasOwnProperty('expiredDate') || moment.utc(link.expiredDate, moment.ISO_8601).isBefore(moment.utc())) {
                    this.alertsService.addGlobalWarning('Your link has expired');
                    return;
                }
                if (link.currentUserAlreadyManagesMntner === true) {
                    this.alertsService.addGlobalWarning(
                        'Your RIPE NCC Access account is already associated with this mntner.',
                        this.makeModificationUrl(this.key),
                        'MODIFY THIS MNTNER',
                    );
                    return;
                }
                this.hashOk = true;
                this.alertsService.addGlobalInfo('You are logged in with the RIPE NCC Access account ' + this.user);
            },
            error: (error: any) => {
                if (this.fmpErrorService.isYourAccountBlockedError(error)) {
                    this.fmpErrorService.setGlobalAccountBlockedError();
                    return;
                }
                let msg = 'Error fetching email-link';
                if (!_.isObject(error.data)) {
                    msg = msg.concat(': ' + error.data);
                }
                console.error(msg);
                this.alertsService.setGlobalError(msg);
            },
        });
    }

    public associate() {
        this.emailLinkService.update(this.localHash).subscribe({
            next: (resp) => {
                console.error('Successfully associated email-link:' + resp);

                this.navigateToSsoAdded(this.key, this.user);
            },
            error: (error: any) => {
                console.error('Error associating email-link:' + JSON.stringify(error));
                if (this.fmpErrorService.isYourAccountBlockedError(error)) {
                    this.fmpErrorService.setGlobalAccountBlockedError();
                    return;
                }
                if (error.status === 400 && !_.isUndefined(error.data) && error.data.match(/already contains SSO/).length === 1) {
                    this.alertsService.setGlobalError(error.data);
                } else {
                    this.alertsService.setGlobalError(
                        `<p>An error occurred while adding the RIPE NCC Access account to the <span class="mntner">MNTNER</span> object.</p>` +
                            `<p>No changes were made to the <span class="mntner">MNTNER</span> object ${this.key}.</p>` +
                            `<p>If this error continues, please contact us at ripe-dbm@ripe.net for assistance.</p>`,
                    );
                }
            },
        });
    }

    public cancelAssociate() {
        this.alertsService.clearAlertMessages();
        this.alertsService.addGlobalWarning(
            `<p>No changes were made to the <span class="mntner">MNTNER</span> object ${this.key}.</p>` +
                `<p>If you wish to add a different RIPE NCC Access account to your <strong>MNTNER</strong> object:` +
                `<ol>` +
                `<li>Sign out of RIPE NCC Access.</li>` +
                `<li>Sign back in to RIPE NCC Access with the account you wish to use.</li>` +
                `<li>Click on the link in the instruction email again.</li>` +
                `</ol>`,
        );
    }

    public makeModificationUrl(key: string) {
        return `webupdates/modify/RIPE/mntner/${key}`;
    }

    private navigateToSsoAdded(mntnerKey: string, user: any) {
        void this.router.navigate(['fmp/ssoAdded', mntnerKey, user]);
    }
}
