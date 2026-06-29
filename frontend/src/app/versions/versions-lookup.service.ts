import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Labels } from '../label.constants';
import { PropertiesService } from '../properties.service';
import { LookupService } from '../query/lookup.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { IObjectVersionResponse, IObjectVersionsModel } from '../shared/whois-response-type.model';

@Injectable({ providedIn: 'root' })
export class VersionsLookupService {
    private lookupService = inject(LookupService);
    private alertsService = inject(AlertsService);
    private http = inject(HttpClient);
    router = inject(Router);
    properties = inject(PropertiesService);

    versionsLookup(source: string, objectType: string, objectName: string): Observable<any> {
        return this.lookupService.lookupWhoisObject({ source, type: objectType, key: objectName }).pipe(
            tap(() => {
                this.alertsService.clearAlertMessages();
                this.alertsService.addGlobalInfo(
                    Labels['msg.searchResultsTandCLink.text'],
                    'https://apps.db.ripe.net/db-web-ui/legal#terms-and-conditions',
                    Labels['msg.termsAndConditions.text'],
                );
            }),
            catchError((err) => {
                this.alertsService.addGlobalError(`An error occurred looking for ${objectType} ${objectName}`);
                return throwError(() => err);
            }),
        );
    }

    getVersion(source: string, objectType: string, objectName: string, firstId: number) {
        return this.http.get<IObjectVersionResponse>(`api/whois/${source}/${objectType}/${objectName}/versions/${firstId}.json`);
    }

    getVersions(source: string, objectType: string, objectName: string): Observable<IObjectVersionsModel> {
        return this.http.get<IObjectVersionsModel>(`api/whois/${source}/${objectType}/${objectName}/versions.json`);
    }

    goToLookup(objectType: string, objectName: string) {
        const queryParam = { source: this.properties.SOURCE, type: objectType, key: objectName };
        void this.router.navigate(['lookup'], { queryParams: queryParam });
    }
}
