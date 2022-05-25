import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WhoisResourcesService } from '../shared/whois-resources.service';

@Injectable()
export class CreateService {
    constructor(private http: HttpClient, private whoisResourcesService: WhoisResourcesService) {}

    public createRoleMntner(source: string, multipleWhoisObjects: any) {
        return this.http.post(`api/whois-internal/api/mntner-pair/${source.toUpperCase()}/role`, multipleWhoisObjects).pipe(
            map((result: any) => {
                console.debug('createRoleMntner success:' + JSON.stringify(result));
                return result;
            }),
            catchError((error: any) => {
                console.error('createRoleMntner error:' + JSON.stringify(error));
                return throwError(this.whoisResourcesService.wrapError(error));
            }),
        );
    }

    public createPersonMntner(source: string, multipleWhoisObjects: any) {
        return this.http.post(`api/whois-internal/api/mntner-pair/${source.toUpperCase()}/person`, multipleWhoisObjects).pipe(
            map((result: any) => {
                console.debug('createRoleMntner success:' + JSON.stringify(result));
                return result;
            }),
            catchError((error: any) => {
                console.error('createRoleMntner error:' + JSON.stringify(error));
                return throwError(this.whoisResourcesService.wrapError(error));
            }),
        );
    }
}
