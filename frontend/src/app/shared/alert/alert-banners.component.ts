import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { BannerComponent, BannerTypes } from '../../banner/banner.component';
import { SanitizeHtmlPipe } from '../sanitize-html.pipe';
import { AlertsService, IAlerts } from './alerts.service';

@Component({
    selector: 'alert-banners',
    templateUrl: './alert-banners.component.html',
    standalone: true,
    imports: [BannerComponent, SanitizeHtmlPipe],
})
export class AlertBannersComponent implements OnInit, OnDestroy {
    alertsService = inject(AlertsService);

    public alerts: IAlerts;
    public subscription: any;

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

    protected readonly BannerTypes = BannerTypes;
}
