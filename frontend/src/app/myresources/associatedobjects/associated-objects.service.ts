import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

export interface IAssociatedObjectApiResult {
    associatedObjects: Array<IAssociatedDomainObject | IAssociatedRouteObject>;
    totalNumberOfResources: number;
    filteredSize: number;
}

export interface IAssociatedObject {
    associatedResource: string;
    associatedResourceType: string;
}

export interface IAssociatedDomainObject extends IAssociatedObject {
    domain: string;
    type: string;
}

export interface IAssociatedRouteObject extends IAssociatedObject {
    prefix: string;
    origin: string;
    type: string;
}

export enum AssociatedObjectType {
    ASSOCIATED_ROUTE = 'route',
    ASSOCIATED_DOMAIN = 'domain',
}

@Injectable()
export class AssociatedObjectsService {
    constructor(private http: HttpClient) {}

    public getAssociatedObjects(
        associatedType: string,
        objectName: string,
        objectType: string,
        page: number,
        filter: string,
    ): Observable<IAssociatedObjectApiResult> {
        if (!objectType) {
            return throwError(() => 'objectType is empty. associated-route-objects not available');
        }
        if (!objectName) {
            return throwError(() => 'objectName is empty. associated-route-objects not available');
        }

        filter = filter ? filter.replace(/\s/g, '') : '';
        const params = new HttpParams().set('filter', filter).set('page', String(page));

        if (associatedType === AssociatedObjectType.ASSOCIATED_ROUTE) {
            return this.http.get<IAssociatedObjectApiResult>(`api/whois-internal/api/resources/${objectType}/${objectName}/associated-route-objects.json`, {
                params,
            });
        } else {
            return this.http.get<IAssociatedObjectApiResult>(`api/whois-internal/api/resources/${objectType}/${objectName}/associated-domain-objects.json`, {
                params,
            });
        }
    }
}
