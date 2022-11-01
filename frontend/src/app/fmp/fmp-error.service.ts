import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertsService } from '../shared/alert/alerts.service';

@Injectable()
export class FmpErrorService {
    constructor(private alertsService: AlertsService) {}

    public isYourAccountBlockedError(error: HttpErrorResponse) {
        return (
            error.status === 403 &&
            !!error.error &&
            error.error.startsWith('Your RIPE NCC Access account has recently been used for an unusually high number of requests')
        );
    }

    public setGlobalAccountBlockedError() {
        this.alertsService.setGlobalError(
            'Your RIPE NCC Access account has recently been used for an unusually high number of requests to access maintainer objects, and has therefore been blocked for security reasons. Please contact us if you believe you should not be blocked.',
            'https://www.ripe.net/contact-form?topic=ripe_dbm&show_form=true',
            'contact us',
        );
    }
}
