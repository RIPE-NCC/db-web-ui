import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { IMoreSpecificsApiResult } from './morespecifics/more-specifics.service';
import { IIPv4ResourcesResponse, IIPv6ResourcesResponse, IIpv4Analysis, IResourceOverviewResponseModel, IResourceTickets } from './resource-type.model';

@Injectable()
export class ResourcesDataService {
    private http = inject(HttpClient);

    public fetchResource(objectName: string, type: string): Observable<IMoreSpecificsApiResult> {
        return this.http.get<IMoreSpecificsApiResult>(`api/whois-internal/api/resources/${type}/${objectName}`);
    }

    public fetchIpv4Resource(objectName: string): Observable<IIPv4ResourcesResponse> {
        return this.http.get<IIPv4ResourcesResponse>(`api/whois-internal/api/resources/inetnum/${objectName}`);
    }

    public fetchIpv6Resource(objectName: string): Observable<IIPv6ResourcesResponse> {
        return this.http.get<IIPv4ResourcesResponse>(`api/whois-internal/api/resources/inet6num/${objectName}`);
    }

    public fetchResources(orgId: string, resourceType: string, sponsored: boolean): Observable<IResourceOverviewResponseModel> {
        if (!resourceType) {
            console.error('fetchResources failed. No resourceType given');
            return;
        }
        const params = new HttpParams().set(sponsored ? 'sponsoring-org-id' : 'org-id', orgId).set('type', resourceType);
        return this.http.get<IResourceOverviewResponseModel>('api/whois-internal/api/resources', { params }).pipe(timeout(60000));
    }

    public fetchIpv4Analysis(orgId: string): Observable<IIpv4Analysis> {
        const params = new HttpParams().set('org-id', orgId);
        return this.http.get<IIpv4Analysis>('api/whois-internal/api/resources/ipanalyser/ipv4.json', { params }).pipe(timeout(30000));
    }

    public fetchTicketsAndDates(orgId: string, resource: string): Observable<IResourceTickets> {
        return this.http.get<IResourceTickets>(`api/ba-apps/resources/${orgId}/${resource}`).pipe(
            catchError((error) => {
                console.debug('Error on tickets retrieval', error);
                return of({
                    tickets: {
                        [resource]: [],
                    },
                });
            }),
        );
    }
}
