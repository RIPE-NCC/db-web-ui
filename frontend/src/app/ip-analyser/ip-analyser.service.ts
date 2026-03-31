import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IpAnalyserService {
    private http = inject(HttpClient);

    private readonly API_BASE_URL: string = 'api/whois-internal/public/ipanalyser/v2';

    getIpv4Analysis(orgId: string): Observable<string> {
        const params = new HttpParams().set('org-id', orgId);
        return this.http.get(`${this.API_BASE_URL}/ipv4`, { params, responseType: 'text' });
    }

    getIpv6Analysis(orgId: string): Observable<string> {
        const params = new HttpParams().set('org-id', orgId);
        return this.http.get(`${this.API_BASE_URL}/ipv6`, { params, responseType: 'text' });
    }
}
