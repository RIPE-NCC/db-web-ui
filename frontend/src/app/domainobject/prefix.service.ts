import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError, zip } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class PrefixService {
    constructor(private http: HttpClient) {}

    public checkNameserverAsync(ns: any, rDnsZone: any) {
        if (!ns) {
            return throwError(() => 'checkNameserverAsync called without ns');
        }

        if (!rDnsZone) {
            return throwError(() => 'checkNameserverAsync called without rDnsZone');
        }

        return this.http.get(`api/dns/status?ignore404=true&ns=${ns}&record=${rDnsZone}`);
    }

    public findExistingDomainsForPrefix(prefixStr: string) {
        const createRequest = (flag: string) => {
            const params = new HttpParams().set('flags', flag).set('ignore404', String(true)).set('query-string', prefixStr).set('type-filter', 'domain');
            return this.http.get('api/rest/search', { params, observe: 'response' }).pipe(catchError((err) => of({})));
        };
        return zip(createRequest('drx'), createRequest('drM'));
    }

    public getDomainCreationStatus(source: string) {
        return this.http.get(`api/whois/domain-objects/${source}/status`, { observe: 'response' });
    }
}
