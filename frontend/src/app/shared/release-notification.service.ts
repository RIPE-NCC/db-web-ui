import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { IProperties, PropertiesService } from '../properties.service';
import { AlertsService } from './alert/alerts.service';

@Injectable()
export class ReleaseNotificationService {
    private buildTime: string;
    private pollInterval: number;
    private isBannerShown: boolean = false;

    constructor(propertiesService: PropertiesService, private httpClient: HttpClient, private alertsService: AlertsService, private router: Router) {
        this.buildTime = propertiesService.DB_WEB_UI_BUILD_TIME;
        this.pollInterval = propertiesService.RELEASE_NOTIFICATION_POLLING;
    }

    public startPolling() {
        this.pollForBuildNumber();
    }

    private pollForBuildNumber() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Cache-Control': 'no-cache',
            }),
        };

        timer(this.pollInterval, this.pollInterval).subscribe(() => {
            this.httpClient.get<IProperties>('app.constants.json', httpOptions).subscribe((response) => {
                const newBuildTime = response.DB_WEB_UI_BUILD_TIME;
                if (this.buildTime !== newBuildTime && !this.isBannerShown) {
                    this.buildTime = newBuildTime;
                    this.isBannerShown = true;
                    this.alertsService.addGlobalWarning('There is a new release available. Click reload to start using it.', this.router.url, 'RELOAD');
                }
            });
        });
    }
}
