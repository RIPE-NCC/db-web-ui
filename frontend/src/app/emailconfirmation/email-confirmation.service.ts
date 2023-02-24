import { HttpClient, HttpParams, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class EmailConfirmationService {
    private readonly API_BASE_URL: string = 'api/whois-internal/api/abuse-validation/validate-token';

    constructor(private http: HttpClient) {}

    public confirmEmail(token: string): Observable<any> {
        if (!token) {
            console.error('Confirming email', token);
            throw new TypeError('ResourcesDataService.fetchParentResource failed: not a resource');
        }

        // temporary hack to work around Angular not uri encoding equals signs:
        // https://github.com/angular/angular/issues/26979
        // https://github.com/angular/angular/issues/18884
        const params = new HttpParams({
            fromObject: {
                token,
            },
            encoder: {
                encodeKey(key: string): string {
                    return encodeURIComponent(key);
                },
                encodeValue(value: string): string {
                    return encodeURIComponent(value);
                },
            } as HttpUrlEncodingCodec,
        });

        return this.http.get(this.API_BASE_URL, { params });
    }
}
