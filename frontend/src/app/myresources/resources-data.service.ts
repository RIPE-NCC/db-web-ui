import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { IIpv4Analysis, IResourceDetailsResponseModel, IResourceOverviewResponseModel, IResourceTickets, ResourceCheck } from './resource-type.model';

@Injectable({ providedIn: 'root' })
export class ResourcesDataService {
    private http = inject(HttpClient);
    private resourceRequests = new Map<string, Observable<IResourceOverviewResponseModel>>();

    fetchResource(objectName: string, type: string): Observable<IResourceDetailsResponseModel> {
        return this.http.get<IResourceDetailsResponseModel>(`api/whois-internal/api/resources/${type}/${objectName}`);
    }

    getResources(orgId: string, resourceType: ObjectTypesEnum, sponsored: boolean): Observable<IResourceOverviewResponseModel> {
        const key = `${orgId}-${resourceType}-${sponsored}`;

        const existingRequest = this.resourceRequests.get(key);

        if (existingRequest) {
            return existingRequest;
        }

        const params = new HttpParams().set(sponsored ? 'sponsoring-org-id' : 'org-id', orgId).set('type', resourceType);
        const request$ = this.http.get<IResourceOverviewResponseModel>(`api/whois-internal/api/resources`, { params }).pipe(timeout(60000), shareReplay(1));

        this.resourceRequests.set(key, request$);

        return request$;
    }

    resourceCheck(objectType: string, name: string): Observable<ResourceCheck[]> {
        return this.http.get<ResourceCheck[]>(`api/whois-internal/public/resourcecheck/${objectType}/${encodeURIComponent(name)}`);
    }

    fetchIpv4Analysis(orgId: string): Observable<IIpv4Analysis> {
        const params = new HttpParams().set('org-id', orgId);
        return this.http.get<IIpv4Analysis>('api/whois-internal/api/resources/ipanalyser/ipv4.json', { params }).pipe(timeout(30000));
    }

    fetchTicketsAndDates(orgId: string, resource: string): Observable<IResourceTickets> {
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
