import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '../shared/alert/alerts.service';

@Component({
    selector: 'mail-sent',
    templateUrl: './mail-sent.component.html',
})
export class MailSentComponent implements OnInit, OnDestroy {
    private alertsService = inject(AlertsService);
    activatedRoute = inject(ActivatedRoute);

    public email: string;

    public ngOnInit() {
        this.email = this.activatedRoute.snapshot.paramMap.get('email');
        this.alertsService.setGlobalSuccess('Success!');
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
    }
}
