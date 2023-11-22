import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SyncupdatesService {
    constructor(private $http: HttpClient) {}

    public update(rpslObject: string): Observable<any> {
        return this.$http.post('api/syncupdates', encodeURIComponent(rpslObject.trim()), {
            responseType: 'text',
            withCredentials: true,
        });
    }
}
