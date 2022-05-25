import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class EmailLinkService {
    private url = 'api/whois-internal/api/fmp-pub/emaillink';

    constructor(private http: HttpClient) {}

    public get(hash: string): Observable<any> {
        return this.http.get(`${this.url}/${hash}.json`);
    }

    public update(hash: string): Observable<any> {
        return this.http.put(`${this.url}/${hash}.json`, { hash });
    }
}
