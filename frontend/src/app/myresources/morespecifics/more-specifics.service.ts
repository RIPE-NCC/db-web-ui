import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IUsage } from '../resource-type.model';

export interface IMoreSpecificsApiResult {
    resources: IMoreSpecificResource[];
    totalNumberOfResources: number;
    filteredSize: number;
}

export interface IMoreSpecificResource {
    netname: string;
    resource: string;
    status: string;
    type: string;
    usage: IUsage;
}

@Injectable()
export class MoreSpecificsService {
    private http = inject(HttpClient);

    public getSpecifics(objectName: string, objectType: string, page: number, filter: string): Observable<IMoreSpecificsApiResult> {
        if (!objectType) {
            return throwError(() => 'objectType is empty. more-specifics not available');
        }
        if (!objectName) {
            return throwError(() => 'objectName is empty. more-specifics not available');
        }
        filter = filter ? filter.replace(/\s/g, '') : '';
        const params = new HttpParams().set('filter', filter).set('page', String(page));
        return this.http.get<IMoreSpecificsApiResult>(`api/whois-internal/api/resources/${objectType}/${objectName}/more-specifics.json`, { params });
    }
}
