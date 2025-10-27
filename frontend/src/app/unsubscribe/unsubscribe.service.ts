import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_HEADER } from '../interceptor/header.interceptor';

@Injectable()
export class UnsubscribeService {
    private http = inject(HttpClient);

    private readonly URL: string = `api/whois-internal/public/unsubscribe`;

    public unsubscribe(messageId: string): Observable<any> {
        if (!messageId) {
            console.error('Unsubscribing email', messageId);
            throw new TypeError('UnsubscribeService.unsubscribe failed: no messageId');
        }
        const headers = new HttpHeaders().set('content-type', 'text/plain').set(SKIP_HEADER, '');
        return this.http.post(this.URL, messageId, { headers, responseType: 'text' as 'json' });
    }

    public getEmailFromMessageId(messageId: string): Observable<any> {
        if (!messageId) {
            console.error('Unsubscribing email', messageId);
            throw new TypeError('UnsubscribeConfirmService.unsubscribe failed: no messageId');
        }

        const params = new HttpParams().set('messageId', messageId);
        const headers = new HttpHeaders().set('content-type', 'text/plain').set(SKIP_HEADER, '');

        return this.http.get(this.URL, { headers, params, responseType: 'text' as 'json' });
    }
}
