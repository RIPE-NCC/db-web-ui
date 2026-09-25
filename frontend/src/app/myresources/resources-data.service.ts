import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { ObjectTypesEnum } from 'src/app/query/object-types.enum';
import { IIpv4Analysis, IResourceDetailsResponseModel, IResourceOverviewResponseModel, IResourceTickets, ResourceCheck } from './resource-type.model';

@Injectable({ providedIn: 'root' })
export class ResourcesDataService {
    private http = inject(HttpClient);
    private resourceCache = new Map<string, IResourceOverviewResponseModel>();
    private resourceCheckCache = new Map<string, Observable<ResourceCheck[]>>();

    fetchResource(objectName: string, type: string): Observable<IResourceDetailsResponseModel> {
        return this.http.get<IResourceDetailsResponseModel>(`api/whois-internal/api/resources/${type}/${objectName}`);
    }

    getResources(orgId: string, resourceType: ObjectTypesEnum, sponsored: boolean): Observable<IResourceOverviewResponseModel> {
        const key = `${orgId}-${resourceType}-${sponsored}`;

        const cached = this.resourceCache.get(key);

        if (cached) {
            return of(cached);
        }

        const params = new HttpParams().set(sponsored ? 'sponsoring-org-id' : 'org-id', orgId).set('type', resourceType);

        return this.http.get<IResourceOverviewResponseModel>('api/whois-internal/api/resources', { params }).pipe(
            timeout(60000),
            tap((response) => {
                this.resourceCache.set(key, response);
            }),
        );
    }

    resourceCheck(objectType: string, name: string): Observable<ResourceCheck[]> {
        const key = `${objectType}:${name}`;

        const cached = this.resourceCheckCache.get(key);

        if (cached) {
            return cached;
        }

        const request$ = this.http
            .get<ResourceCheck[]>(`api/whois-internal/public/resourcecheck/${objectType}/${encodeURIComponent(name)}`)
            .pipe(shareReplay(1));

        this.resourceCheckCache.set(key, request$);

        return request$;
    }

    clearResourceCheckCache(): void {
        this.resourceCheckCache.clear();
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
