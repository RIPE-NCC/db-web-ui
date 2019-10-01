import {HttpClient, HttpParams} from "@angular/common/http";
import {Inject, Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {forkJoin, Observable, of, throwError} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap, tap} from "rxjs/operators";
import {WhoisResourcesService} from "../shared/whois-resources.service";
import {IMntByModel} from "../shared/whois-response-type.model";

@Injectable()
export class RestService {

    constructor(private http: HttpClient,
                private router: Router,
                private whoisResourcesService: WhoisResourcesService) {}

    public fetchParentResource(objectType: string, qs: string) {
        // e.g. https://rest.db.ripe.net/search?flags=lr&type-filter=inetnum&query-string=193.0.4.0%20-%20193.0.4.255
        if (["inetnum", "inet6num", "aut-num"].indexOf(objectType) < 0) {
            console.error("Only aut-num, inetnum and inet6num supported");
            return;
        }
        const params = new HttpParams()
            .set("flags", "lr")
            .set("ignore404", String(true))
            .set("query-string", qs)
            .set("type-filter", objectType);
        return this.http.get("api/whois/search", {params})
            .toPromise();
    }

    public fetchResource(objectType: string, qs: string) {
        if (["inetnum", "inet6num", "aut-num"].indexOf(objectType) < 0) {
            console.error("Only aut-num, inetnum and inet6num supported");
            return;
        }
        const params = new HttpParams()
            .set("flags", "r")
            .set("ignore404", String(true))
            .set("query-string", qs)
            .set("type-filter", objectType);
        return this.http.get("api/whois/search", {params})
            .toPromise();
    }

    public getReferences(source: string, objectType: string, name: string, limit: string) {
        const params = new HttpParams()
            .set("limit", limit);
        const encodedName = encodeURIComponent(name); // NOTE: we perform double encoding of forward slash (%2F ->%252F) to make spring MVC happy
        return this.http.get(`api/references/${source.toUpperCase()}/${objectType}/${encodeURIComponent(encodedName)}`, {params})
            .pipe(
                tap((result: any) => {
                            console.debug("getReferences success:" + JSON.stringify(result));
                        }, (error: any) => {
                            console.debug("getReferences error:" + JSON.stringify(error));
                        }))
            .toPromise();
    }

    public fetchMntnersForSSOAccount(): Observable<IMntByModel[]> {
        return this.http.get("api/user/mntners")
            .pipe(
                tap(// Log the result or error
                    (result: IMntByModel[]) => console.debug("fetchMntnersForSSOAccount success:" + JSON.stringify(result)),
                    (error) => console.error("fetchMntnersForSSOAccount error:" + JSON.stringify(error)),
                ));
    }

    public detailsForMntners(mntners: any) {
        const promis: any[] = _.map(mntners, (item: any) => this._singleMntnerDetails(item));
        return forkJoin(promis).toPromise();
    }

    // https://alligator.io/angular/real-time-search-angular-rxjs/
    // query in all component calling this method should be converted in Observale<string>
    public autocomplete(attrName: string, query: string, extended: any, attrsToBeReturned: string[]) {
        return of(query).pipe(
            debounceTime(2000),
            distinctUntilChanged(),
            switchMap(term => this.queryAutocomplete(attrName, term, extended, attrsToBeReturned))).toPromise();
    }

    private queryAutocomplete(attrName: string, query: any, extended: any, attrsToBeReturned: string[] = []) {
        if (_.isUndefined(query) || query.length < 2) {
            return new Promise((resolve) => []);
        } else {
            let params = new HttpParams();
            attrsToBeReturned.forEach(at => params = params.append("attribute", at));

            params = params.set("extended", extended)
                .set("field", attrName)
                .set("query", query);
            return this.http.get("api/whois/autocomplete", {params})
                .pipe(
                    tap((result: any) => console.debug("autocomplete success:" + JSON.stringify(result)),
                        (error: any) => console.error("autocomplete error:" + JSON.stringify(error))));
        }
    }

    // https://alligator.io/angular/real-time-search-angular-rxjs/
    // query in all component calling this method should be converted in Observale<string>
    public autocompleteAdvanced(query: Observable<string>, targetObjectTypes: string[]) {
        return query.pipe(
            debounceTime(600),
            distinctUntilChanged(),
            switchMap(term => this.queryAutocompleteAdvanced(term, targetObjectTypes))).toPromise();
    }

    private queryAutocompleteAdvanced(query: any, targetObjectTypes: string[]) {
        if (_.isUndefined(query) || query.length < 2) {
            return new Promise((resolve) => []);
        } else {
            const attrsToFilterOn: string[] = this.whoisResourcesService.getFilterableAttrsForObjectTypes(targetObjectTypes);
            const attrsToReturn: string[] = this.whoisResourcesService.getViewableAttrsForObjectTypes(targetObjectTypes); // ["person", "role", "org-name", "abuse-mailbox"];

            let params = new HttpParams();
            targetObjectTypes.map((attr) => params = params.append("from", attr));
            params = params.set("like", query);
            attrsToReturn.map((attr) => params = params.append("select", attr));
            attrsToFilterOn.map((attr) => params = params.append("where", attr));
            return this.http.get("api/whois/autocomplete", {params})
                .pipe(
                    tap((result: any) => console.debug("autocompleteAdvanced success:" + JSON.stringify(result)),
                        (error: any) => console.error("autocompleteAdvanced error:" + JSON.stringify(error))))
                .toPromise();
        }
    }

    public authenticate(method: any, source: string, objectType: string, objectName: string, passwords: string) {
        if (!source) {
            throw new TypeError("restService.authenticate source must have a value");
        }
        const params = new HttpParams()
            .set("password", passwords)
            .set("unfiltered", "true");
        const decodeURI = decodeURIComponent(objectName); // prevent double encoding of forward slash (%2f ->%252F)
        return this.http.get(`api/whois/${source.toUpperCase()}/${objectType}/${decodeURI}`, {params})
            .pipe(
                map((result: any) => {
                    console.debug("authenticate success:" + JSON.stringify(result));
                    return this.whoisResourcesService.wrapSuccess(result);
                }),
                catchError((error: any, caught: Observable<any>) => {
                    console.error("authenticate error:" + JSON.stringify(error));
                    return throwError(this.whoisResourcesService.wrapError(error));
                }))
            .toPromise();
    }

    public fetchObject(source: string, objectType: string, objectName: string, passwords?: any, unformatted?: any) {
        let params = new HttpParams();
        if (passwords) {
            if (Array.isArray(passwords)) {
                passwords.forEach(password => params = params.append("password", password));
            } else {
                params = params.set("password", passwords);
            }
        }
        params = params.set("unfiltered", "true");
        if (unformatted) { params = params.set("unformatted", unformatted); }
        return this.http.get(`api/whois/${source.toUpperCase()}/${objectType}/${encodeURIComponent(objectName)}`, {params})
            .pipe(
                map((result: any) => {
                    console.debug("fetchObject success:" + JSON.stringify(result));
                    const primaryKey = this.whoisResourcesService.wrapSuccess(result).getPrimaryKey();
                    if (_.isEqual(objectName, primaryKey)) {
                        return this.whoisResourcesService.wrapSuccess(result);
                    } else {
                        return this.router.navigateByUrl(`webupdates/modify/${source}/${objectType}/${primaryKey}`);
                    }
                }),
                catchError((error: any, caught: Observable<any>) => {
                    console.error("fetchObject error:" + JSON.stringify(error));
                    return throwError(this.whoisResourcesService.wrapError(error));
                }));
    }

    public createObject(source: string, objectType: string, attributes: any, passwords: string[], overrides?: any, unformatted?: any) {
        let params = new HttpParams();
        if (overrides) {
            params = params.set("override",  overrides)
        }
        if (passwords) {
            if (Array.isArray(passwords)) {
                passwords.forEach(password => params = params.append("password", password));
            } else {
                params = params.set("password", passwords);
            }
        }
        if (unformatted) {
            params = params.set("unformatted", unformatted)
        }
        return this.http.post( `api/whois/${source}/${objectType}`, attributes, {params})
            .pipe(
                map((result: any) => {
                        console.debug("createObject success:" + JSON.stringify(result));
                        return this.whoisResourcesService.wrapSuccess(result);
                    }),
                catchError((error: any, caught: Observable<any>) => {
                    if (!error) {
                        throw new TypeError("Unknown error createObject");
                    } else {
                        console.error("createObject error:" + JSON.stringify(error));
                        return throwError(this.whoisResourcesService.wrapError(error));
                    }
                }));
    }

    public modifyObject(source: string, objectType: string, objectName: any, attributes: any, passwords: any, overrides?: any, unformatted?: any) {
        let params = new HttpParams();
        if (overrides) {params = params.set("override", overrides); }
        if (passwords) {
            if (Array.isArray(passwords)) {
                passwords.forEach(password => params = params.append("password", password));
            } else {
                params = params.set("password", passwords);
            }
        }
        if (unformatted) {params = params.set("unformatted", unformatted); }
        const name = decodeURIComponent(objectName); // prevent double encoding of forward slash (%2f ->%252F)
        return this.http.put(`api/whois/${source.toUpperCase()}/${objectType}/${name}`, attributes, {params})
            .pipe(
                map((result: any) => {
                    console.debug("modifyObject success:" + JSON.stringify(result));
                    return this.whoisResourcesService.wrapSuccess(result);
                }),
                catchError((error: any, caught: Observable<any>) => {
                    console.error("modifyObject error:" + JSON.stringify(error));
                    return throwError(this.whoisResourcesService.wrapError(error));
                }));
    }

    public associateSSOMntner(source: string, objectType: string, objectName: string, whoisResources: any, passwords: string) {
        return this.http.put(`api/whois/${source}/${objectType}/${objectName}?password=${encodeURIComponent(passwords)}`, whoisResources)
            .pipe(
                tap(
                    (result: any) => console.debug("associateSSOMntner success:" + JSON.stringify(result.data)),
                    (error: any) => console.error("associateSSOMntner error:" + JSON.stringify(error)),
                ))
            .toPromise();
    }

    public deleteObject(source: string, objectType: string, name: string, reason: string, withReferences: any, passwords: string, dryRun: boolean = false) {
        const service = withReferences ? "references" : "whois";
        let params = new HttpParams()
            .set("dry-run", String(!!dryRun))
            .set("reason", reason);
        if (passwords) {
            if (Array.isArray(passwords)) {
                passwords.forEach(password => params = params.append("password", password));
            } else {
                params = params.set("password", passwords);
            }
        }
        return this.http.delete(`api/${service}/${source.toUpperCase()}/${objectType}/${encodeURIComponent(name)}`, {params})
            .pipe(
                map((result: any) => {
                    console.debug("deleteObject success:" + JSON.stringify(result));
                    return this.whoisResourcesService.wrapSuccess(result);
                }),
                catchError((error: any, caught: Observable<any>) => {
                    console.error("deleteObject error:" + JSON.stringify(error));
                    return throwError(this.whoisResourcesService.wrapError(error));
                }));
    }

    public createDomainObject(domainObject: any, source: string) {
        return this.http.post(`api/whois/domain-objects/${source.toUpperCase()}`, domainObject);
    }

    private _singleMntnerDetails(mntner: IMntByModel) {
        const params = new HttpParams()
            .set("attribute", "auth")
            .set("extended", "true")
            .set("field", "mntner")
            .set("query", mntner.key);
        return this.http.get("api/whois/autocomplete", {params})
            .pipe(
                map((result: any) => {
                    let found = _.find(result, (item: IMntByModel) => {
                        return item.key === mntner.key;
                    });
                    if (_.isUndefined(found)) {
                        // TODO: the  autocomplete service just returns 10 matching records. The exact match might not be part of this set.
                        // So if this happens, perform best guess and just enrich the existing mntner with md5.
                        mntner.auth = ["MD5-PW"];
                        found = mntner;
                    } else {
                        found.mine = mntner.mine;
                    }
                    console.debug("_singleMntnerDetails success:" + JSON.stringify(found));
                    return found;
                }),
                catchError((error: any, caught: Observable<any>) => {
                    console.error("_singleMntnerDetails error:" + JSON.stringify(error));
                    return throwError(error);
                }));
    }
}
