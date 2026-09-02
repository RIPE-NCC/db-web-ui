import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PropertiesService } from '../properties.service';
import { IObjectVersionResponse, IObjectVersionsModel } from '../shared/whois-response-type.model';

@Injectable({ providedIn: 'root' })
export class VersionsLookupService {
    private http = inject(HttpClient);
    router = inject(Router);
    properties = inject(PropertiesService);

    getVersion(source: string, objectType: string, objectName: string, firstId: number) {
        return this.http.get<IObjectVersionResponse>(`api/whois/${source}/${objectType}/${objectName}/versions/${firstId}.json`);
    }

    getVersions(source: string, objectType: string, objectName: string): Observable<IObjectVersionsModel> {
        return this.http.get<IObjectVersionsModel>(`api/whois/${source}/${objectType}/${objectName}/versions.json`);
    }
}
