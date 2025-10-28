import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { of, zip } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PrefixService {
    private http = inject(HttpClient);

    public findExistingDomainsForPrefix(prefixStr: string) {
        const createRequest = (flag: string) => {
            const params = new HttpParams().set('flags', flag).set('ignore404', String(true)).set('query-string', prefixStr).set('type-filter', 'domain');
            return this.http.get('api/rest/search', { params, observe: 'response' }).pipe(catchError(() => of({})));
        };
        return zip(createRequest('drx'), createRequest('drM'));
    }

    public getDomainCreationStatus(source: string) {
        return this.http.get(`api/whois/domain-objects/${source}/status`, { observe: 'response' });
    }
}
