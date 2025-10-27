import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EmailLinkService {
    private http = inject(HttpClient);

    private url = 'api/whois-internal/api/fmp-pub/emaillink';

    public get(hash: string): Observable<any> {
        return this.http.get(`${this.url}/${hash}.json`);
    }

    public update(hash: string): Observable<any> {
        return this.http.put(`${this.url}/${hash}.json`, { hash });
    }
}
