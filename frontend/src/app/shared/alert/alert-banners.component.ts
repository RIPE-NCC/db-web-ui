import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertsService, IAlerts } from './alerts.service';

@Component({
    selector: 'alert-banners',
    templateUrl: './alert-banners.component.html',
})
export class AlertBannersComponent implements OnInit, OnDestroy {
    public alerts: IAlerts;
    public subscription: any;

    constructor(public alertsService: AlertsService) {}

    public ngOnInit() {
        this.alerts = this.alertsService.alerts;
        this.subscription = this.alertsService.alertsChanged.subscribe((alerts: IAlerts) => {
            this.alerts = alerts;
        });
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
