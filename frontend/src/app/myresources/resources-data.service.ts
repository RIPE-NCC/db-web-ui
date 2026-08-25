import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { IIpv4Analysis, IResourceDetailsResponseModel, IResourceOverviewResponseModel, IResourceTickets, ResourceCheck } from './resource-type.model';

@Injectable({ providedIn: 'root' })
export class ResourcesDataService {
    private http = inject(HttpClient);

    fetchResource(objectName: string, type: string): Observable<IResourceDetailsResponseModel> {
        return this.http.get<IResourceDetailsResponseModel>(`api/whois-internal/api/resources/${type}/${objectName}`);
    }

    fetchResources(orgId: string, resourceType: string, sponsored: boolean): Observable<IResourceOverviewResponseModel> {
        if (!resourceType) {
            console.error('fetchResources failed. No resourceType given');
            return;
        }
        const params = new HttpParams().set(sponsored ? 'sponsoring-org-id' : 'org-id', orgId).set('type', resourceType);
        return this.http.get<IResourceOverviewResponseModel>('api/whois-internal/api/resources', { params }).pipe(timeout(60000));
    }

    checkIsAnnounced(objectType: string, name: string): Observable<ResourceCheck[]> {
        return this.http.get<ResourceCheck[]>(`api/whois-internal/public/resourcecheck/${objectType}/${name}`);
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
