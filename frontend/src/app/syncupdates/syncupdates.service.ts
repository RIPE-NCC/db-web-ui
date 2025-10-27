import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SyncupdatesService {
    private $http = inject(HttpClient);

    public update(rpslObject: string): Observable<any> {
        return this.$http.post('api/syncupdates', encodeURIComponent(rpslObject.trim()), {
            responseType: 'text',
            withCredentials: true,
        });
    }
}
