import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KeyType } from './create-new-api-key/create-new-api-key.component';
import { ApiKey } from './types';

const endpointMap: Record<KeyType, string> = {
    [KeyType.MY_RESOURCES]: 'myresources',
    [KeyType.IP_ANALYSER]: 'ipanalyser',
    [KeyType.MAINTAINER]: '',
};

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
    private http = inject(HttpClient);

    private readonly API_BASE_URL: string = 'api/whois-internal/public/api-key';

    saveApiKey(apiKeyName: string, expiresAt: string, apiKeyType: KeyType, mnts: string[], orgId: string): Observable<ApiKey> {
        const details = apiKeyType === KeyType.MAINTAINER ? mnts : [orgId];

        const body = {
            label: apiKeyName,
            expiresAt,
            details,
        };

        const url = apiKeyType === KeyType.MAINTAINER ? this.API_BASE_URL : `${this.API_BASE_URL}/${endpointMap[apiKeyType]}`;
        return this.http.post<ApiKey>(url, body);
    }
}
