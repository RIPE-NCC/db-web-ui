import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_HEADER } from '../interceptor/header.interceptor';

@Injectable()
export class UnsubscribeConfirmService {
    private readonly URL: string = `api/whois-internal/public/unsubscribe`;

    constructor(private http: HttpClient) {}

    public getEmailFromMessageId(messageId: string): Observable<any> {
        if (!messageId) {
            console.error('Unsubscribing email', messageId);
            throw new TypeError('UnsubscribeConfirmService.unsubscribe failed: no messageId');
        }

        const params = new HttpParams().set('messageId', messageId);
        const headers = new HttpHeaders().set('content-type', 'text/plain').set(SKIP_HEADER, '');

        const email = this.http.get(this.URL, { headers, params });
        console.log('response from api is: ' + email);
        return email;
    }
}
