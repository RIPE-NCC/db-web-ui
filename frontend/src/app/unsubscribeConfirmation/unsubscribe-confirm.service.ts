import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_HEADER } from '../interceptor/header.interceptor';

@Injectable()
export class UnsubscribeConfirmService {
    private readonly URL: string = `api/whois-internal/public/unsubscribe/`;

    constructor(private http: HttpClient) {}

    public getEmailFromMessageId(messageId: string): Observable<any> {
        if (!messageId) {
            console.error('Unsubscribing email', messageId);
            throw new TypeError('UnsubscribeConfirmService.unsubscribe failed: no messageId');
        }

        console.log('sending request to whois-inernal to fetch email');
        const headers = new HttpHeaders().set('content-type', 'text/plain').set(SKIP_HEADER, '');
        return this.http.get(this.URL + messageId, { headers, responseType: 'text' as 'json' });
    }
}
