import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '../shared/alert/alerts.service';

@Component({
    selector: 'sso-added',
    templateUrl: './sso-added.component.html',
})
export class SsoAddedComponent implements OnInit, OnDestroy {
    private activatedRoute = inject(ActivatedRoute);
    private alertsService = inject(AlertsService);

    public mntnerKey: string;
    public user: any;

    public ngOnInit() {
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.mntnerKey = paramMap.get('mntnerKey');
        this.user = paramMap.get('user');
        this.alertsService.setGlobalSuccess('Success!');
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
    }
}
