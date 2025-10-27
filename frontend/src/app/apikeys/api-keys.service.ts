import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiKey } from './types';

@Injectable()
export class ApiKeysService {
    private http = inject(HttpClient);

    private readonly API_BASE_URL: string = 'api/whois-internal/public/api-key';

    saveApiKey(apiKeyName: string, expiresAt: string, mnts: string[]): Observable<ApiKey> {
        const body = {
            label: apiKeyName,
            expiresAt,
            details: mnts,
        };
        return this.http.post<ApiKey>(this.API_BASE_URL, body);
    }

    getApiKeys(): Observable<ApiKey[]> {
        return this.http.get<ApiKey[]>(this.API_BASE_URL);
    }

    deleteApiKey(id: string) {
        return this.http.delete(`${this.API_BASE_URL}/${id}`);
    }
}
