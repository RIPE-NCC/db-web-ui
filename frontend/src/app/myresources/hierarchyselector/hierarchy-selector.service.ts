import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, timeout } from 'rxjs/operators';
import { IResourceModel } from '../resource-type.model';

@Injectable()
export class HierarchySelectorService {
    private http = inject(HttpClient);

    private cashHierarchy: string[];

    public fetchParentResources(resource: IResourceModel, org: string): Observable<string[]> {
        if (!resource || !resource.resource || !resource.type) {
            console.error('Not a resource', resource);
            throw new TypeError('ResourcesDataService.fetchParentResource failed: not a resource');
        }
        if (this.cashHierarchy && this.cashHierarchy.includes(resource.resource)) {
            return of(this.cashHierarchy.splice(0, this.cashHierarchy.indexOf(resource.resource)));
        }
        const type = resource.type;
        const key = resource.resource;
        const params = new HttpParams().set('key', key).set('org', org).set('type', type);
        return this.http.get<string[]>('api/whois/hierarchy/parents-of', { params }).pipe(
            timeout(10000),
            tap({
                next: (result: string[]) => (this.cashHierarchy = result),
                error: (error: any) => console.error('hierarchy parents-of error:' + JSON.stringify(error)),
            }),
        );
    }

    public getParent(child: string): string {
        return this.cashHierarchy[this.cashHierarchy.indexOf(child) - 1];
    }
}
