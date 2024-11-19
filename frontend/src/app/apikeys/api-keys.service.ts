import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiKey } from './types';

@Injectable()
export class ApiKeysService {
    private readonly API_BASE_URL: string = 'api/whois-internal/public/api-key';

    constructor(private http: HttpClient) {}

    saveApiKey(apiKeyName: string, expirationDate: string, mnt: string): Observable<ApiKey> {
        const body = {
            name: apiKeyName,
            expirationDate,
            details: mnt,
        };
        return this.http.post<ApiKey>(this.API_BASE_URL, body);
    }

    getApiKeys(): Observable<ApiKey[]> {
        return this.http.get<ApiKey[]>(this.API_BASE_URL);
    }

    deleteApiKey(accessKey: string) {
        return this.http.delete(`${this.API_BASE_URL}/${accessKey}`);
    }
}
