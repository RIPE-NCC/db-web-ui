import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class RpkiValidatorService {
    constructor(private http: HttpClient) {}

    hasRoa(origin: string, route: string) {
        const params = new HttpParams().set('origin', origin).set('route', route);
        return this.http.get<any>(`api/whois-internal/public/rpki/roa`, { params });
    }
}
