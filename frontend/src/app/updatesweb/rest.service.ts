import { HttpClient, HttpParameterCodec, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { WhoisResourcesService } from '../shared/whois-resources.service';
import { IMntByModel } from '../shared/whois-response-type.model';

@Injectable()
export class RestService {
    constructor(private http: HttpClient, private router: Router, private whoisResourcesService: WhoisResourcesService) {}

    public fetchParentResource(objectType: string, qs: string) {
        // e.g. https://rest.db.ripe.net/search?flags=lr&type-filter=inetnum&query-string=193.0.4.0%20-%20193.0.4.255
        return this.searchWhois(objectType, qs, 'lr');
    }

    public fetchResource(objectType: string, qs: string) {
        return this.searchWhois(objectType, qs, 'r');
    }

    private searchWhois(objectType: string, qs: string, flag: string) {
        if (['inetnum', 'inet6num', 'aut-num'].indexOf(objectType) < 0) {
            console.error('Only aut-num, inetnum and inet6num supported');
            return;
        }
        const params = new HttpParams().set('flags', flag).set('ignore404', String(true)).set('query-string', qs).set('type-filter', objectType);
        return this.http.get('api/whois/search', { params });
    }

    public getReferences(source: string, objectType: string, name: string, limit: string) {
        const params = new HttpParams().set('limit', limit);
        return this.http.get(`api/references/${source.toUpperCase()}/${objectType}/${encodeURIComponent(name)}`, { params }).pipe(
            tap({
                next: (result: any) => {
                    console.debug('getReferences success:' + JSON.stringify(result));
                },
                error: (error: any) => {
                    console.debug('getReferences error:' + JSON.stringify(error));
                },
            }),
        );
    }

    public fetchMntnersForSSOAccount(): Observable<IMntByModel[]> {
        return this.http.get('api/user/mntners').pipe(
            tap({
                next: (result: IMntByModel[]) => console.debug('fetchMntnersForSSOAccount success:' + JSON.stringify(result)),
                error: (error) => console.error('fetchMntnersForSSOAccount error:' + JSON.stringify(error)),
            }),
        );
    }

    public detailsForMntners(mntners: any) {
        const promise: any[] = mntners.map((item: any) => this.singleMntnerDetails(item));
        return forkJoin(promise);
    }

    public autocomplete(attrName: string, query: string, extended: any, attrsToBeReturned: string[]) {
        return of(query).pipe(
            debounceTime(2000),
            distinctUntilChanged(),
            switchMap((term) => this.queryAutocomplete(attrName, term, extended, attrsToBeReturned)),
        );
    }

    private queryAutocomplete(attrName: string, query: any, extended: any, attrsToBeReturned: string[] = []) {
        if (_.isUndefined(query) || query.length < 2) {
            return of([]);
        } else {
            let params = new HttpParams();
            attrsToBeReturned.forEach((at) => (params = params.append('attribute', at)));

            params = params.set('extended', extended).set('field', attrName).set('query', query);
            return this.http.get('api/whois/autocomplete', { params }).pipe(
                tap({
                    next: (result: any) => console.debug('autocomplete success:' + JSON.stringify(result)),
                    error: (error: any) => console.error('autocomplete error:' + JSON.stringify(error)),
                }),
            );
        }
    }

    public autocompleteAdvanced(query: Observable<string>, targetObjectTypes: string[]) {
        return query.pipe(
            debounceTime(600),
            distinctUntilChanged(),
            switchMap((term) => this.queryAutocompleteAdvanced(term, targetObjectTypes)),
        );
    }

    private queryAutocompleteAdvanced(query: string, targetObjectTypes: string[]) {
        if (_.isUndefined(query) || query.length < 2) {
            return of([]);
        } else {
            const attrsToFilterOn: string[] = this.whoisResourcesService.getFilterableAttrsForObjectTypes(targetObjectTypes);
            const attrsToReturn: string[] = this.whoisResourcesService.getViewableAttrsForObjectTypes(targetObjectTypes);

            let params = new HttpParams();
            targetObjectTypes.forEach((attr) => (params = params.append('from', attr)));
            params = params.set('like', query);
            attrsToReturn.forEach((attr) => (params = params.append('select', attr)));
            attrsToFilterOn.forEach((attr) => (params = params.append('where', attr)));
            return this.http.get('api/whois/autocomplete', { params }).pipe(
                tap({
                    next: (result: any) => console.debug('autocompleteAdvanced success:' + JSON.stringify(result)),
                    error: (error: any) => console.error('autocompleteAdvanced error:' + JSON.stringify(error)),
                }),
            );
        }
    }

    public authenticate(source: string, objectType: string, objectName: string, passwords?: any, override?: string) {
        if (!source) {
            throw new TypeError('restService.authenticate source must have a value');
        }
        const params = this.setParams(passwords, override).set('unfiltered', 'true');
        const decodeURI = decodeURIComponent(objectName); // prevent double encoding of forward slash (%2f ->%252F)
        return this.http.get(`api/whois/${source.toUpperCase()}/${objectType}/${decodeURI}`, { params }).pipe(
            map((result: any) => {
                console.debug('authenticate success:' + JSON.stringify(result));
                return this.whoisResourcesService.wrapSuccess(result);
            }),
            catchError((error: any) => {
                console.error('authenticate error:' + JSON.stringify(error));
                return throwError(() => this.whoisResourcesService.wrapError(error));
            }),
        );
    }

    public fetchObject(source: string, objectType: string, objectName: string, passwords?: any, unformatted?: any) {
        let params = new HttpParams({ encoder: new CustomHttpParamEncoder() });
        if (passwords) {
            if (Array.isArray(passwords)) {
                passwords.forEach((password) => (params = params.append('password', password)));
            } else {
                params = params.set('password', passwords);
            }
        }
        params = params.set('unfiltered', 'true');
        if (unformatted) {
            params = params.set('unformatted', unformatted);
        }
        return this.http.get(`api/whois/${source.toUpperCase()}/${objectType}/${encodeURIComponent(objectName)}`, { params }).pipe(
            map((result: any) => {
                console.debug('fetchObject success:' + JSON.stringify(result));
                const primaryKey = this.whoisResourcesService.getPrimaryKey(this.whoisResourcesService.wrapSuccess(result));
                if (_.isEqual(objectName.toUpperCase(), primaryKey.toUpperCase())) {
                    return this.whoisResourcesService.wrapSuccess(result);
                } else {
                    return this.router.navigateByUrl(`webupdates/modify/${source}/${objectType}/${primaryKey}`);
                }
            }),
            catchError((error: any) => {
                console.error('fetchObject error:' + JSON.stringify(error));
                return throwError(() => this.whoisResourcesService.wrapError(error));
            }),
        );
    }

    private setParams(passwords: string[], override?: any, unformatted?: any): HttpParams {
        let params = new HttpParams({ encoder: new CustomHttpParamEncoder() });
        if (override) {
            params = params.set('override', override);
        }
        if (passwords) {
            if (Array.isArray(passwords)) {
                passwords.forEach((password) => (params = params.append('password', password)));
            } else {
                params = params.set('password', passwords);
            }
        }
        if (unformatted) {
            params = params.set('unformatted', unformatted);
        }
        return params;
    }

    public createObject(source: string, objectType: string, attributes: any, passwords: string[], overrides?: any, unformatted?: any) {
        let params = this.setParams(passwords, overrides, unformatted);
        return this.http.post(`api/whois/${source}/${objectType}`, attributes, { params }).pipe(
            map((result: any) => {
                console.debug('createObject success:' + JSON.stringify(result));
                return this.whoisResourcesService.wrapSuccess(result);
            }),
            catchError((error: any) => {
                if (!error) {
                    throw new TypeError('Unknown error createObject');
                } else {
                    console.error('createObject error:' + JSON.stringify(error));
                    return throwError(() => this.whoisResourcesService.wrapError(error));
                }
            }),
        );
    }

    public modifyObject(source: string, objectType: string, objectName: any, attributes: any, passwords: any, overrides?: any, unformatted?: any) {
        let params = this.setParams(passwords, overrides, unformatted);
        const name = decodeURIComponent(objectName); // prevent double encoding of forward slash (%2f ->%252F)
        return this.http.put(`api/whois/${source.toUpperCase()}/${objectType}/${name}`, attributes, { params }).pipe(
            map((result: any) => {
                console.debug('modifyObject success:' + JSON.stringify(result));
                return this.whoisResourcesService.wrapSuccess(result);
            }),
            catchError((error: any) => {
                console.error('modifyObject error:' + JSON.stringify(error));
                return throwError(() => this.whoisResourcesService.wrapError(error));
            }),
        );
    }

    public associateSSOMntnerByOverride(source: string, objectType: string, objectName: string, whoisResources: any, override: string) {
        return this.http.put(`api/whois/${source}/${objectType}/${objectName}?override=${encodeURIComponent(override)}`, whoisResources).pipe(
            tap({
                next: (result: any) => console.debug('associateSSOMntner success:' + JSON.stringify(result.data)),
                error: (error: any) => console.error('associateSSOMntner error:' + JSON.stringify(error)),
            }),
        );
    }

    public associateSSOMntner(source: string, objectType: string, objectName: string, whoisResources: any, passwords: string) {
        return this.http.put(`api/whois/${source}/${objectType}/${objectName}?password=${encodeURIComponent(passwords)}`, whoisResources).pipe(
            tap({
                next: (result: any) => console.debug('associateSSOMntner success:' + JSON.stringify(result.data)),
                error: (error: any) => console.error('associateSSOMntner error:' + JSON.stringify(error)),
            }),
        );
    }

    public deleteObject(source: string, objectType: string, name: string, reason: string, withReferences: any, passwords: string[], dryRun: boolean = false) {
        const service = withReferences ? 'references' : 'whois';
        let params = new HttpParams({ encoder: new CustomHttpParamEncoder() }).set('dry-run', String(!!dryRun)).set('reason', reason);
        if (passwords) {
            if (Array.isArray(passwords)) {
                passwords.forEach((password) => (params = params.append('password', password)));
            } else {
                params = params.set('password', passwords);
            }
        }
        return this.http.delete(`api/${service}/${source.toUpperCase()}/${objectType}/${encodeURIComponent(name)}`, { params }).pipe(
            map((result: any) => {
                console.debug('deleteObject success:' + JSON.stringify(result));
                return this.whoisResourcesService.wrapSuccess(result);
            }),
            catchError((error: any) => {
                console.error('deleteObject error:' + JSON.stringify(error));
                return throwError(() => this.whoisResourcesService.wrapError(error));
            }),
        );
    }

    public createDomainObject(domainObject: any, source: string) {
        return this.http.post(`api/whois/domain-objects/${source.toUpperCase()}`, domainObject);
    }

    private singleMntnerDetails(mntner: IMntByModel) {
        const params = new HttpParams().set('attribute', 'auth').set('extended', 'true').set('field', 'mntner').set('query', mntner.key);
        return this.http.get('api/whois/autocomplete', { params }).pipe(
            map((result: any) => {
                let found = _.find(result, (item: IMntByModel) => {
                    return item.key === mntner.key;
                });
                if (_.isUndefined(found)) {
                    // NOTE: the  autocomplete service just returns 10 matching records. The exact match might not be part of this set.
                    // So if this happens, perform best guess and just enrich the existing mntner with md5.
                    mntner.auth = ['MD5-PW'];
                    found = mntner;
                } else {
                    found.mine = mntner.mine;
                }
                console.debug('singleMntnerDetails success:' + JSON.stringify(found));
                return found;
            }),
            catchError((error: any) => {
                console.error('singleMntnerDetails error:' + JSON.stringify(error));
                return throwError(() => error);
            }),
        );
    }
}

export class CustomHttpParamEncoder implements HttpParameterCodec {
    encodeKey(key: string): string {
        return encodeURIComponent(key);
    }

    encodeValue(value: string): string {
        return encodeURIComponent(value);
    }

    decodeKey(key: string): string {
        return decodeURIComponent(key);
    }

    decodeValue(value: string): string {
        return decodeURIComponent(value);
    }
}
