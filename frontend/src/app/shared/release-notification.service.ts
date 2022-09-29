import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timer } from 'rxjs';
import { IProperties, PropertiesService } from '../properties.service';
import { AlertsService } from './alert/alerts.service';

@Injectable()
export class ReleaseNotificationService {
    private buildTime: string;
    private pollInterval: number;

    constructor(propertiesService: PropertiesService, private httpClient: HttpClient, private alertsService: AlertsService) {
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
                if (this.buildTime !== newBuildTime) {
                    this.buildTime = newBuildTime;
                    this.alertsService.addGlobalWarning('There is a new release available. Click reload to start using it.', document.location.href, 'RELOAD');
                }
            });
        });
    }
}
