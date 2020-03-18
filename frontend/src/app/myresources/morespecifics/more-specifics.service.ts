import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, of, throwError} from "rxjs";
import {delay, retryWhen, switchMap} from "rxjs/operators";
import {IUsage} from "../resource-type.model";

export interface IMoreSpecificsApiResult {
    resources: IMoreSpecificResource[];
    totalNumberOfResources: number;
    filteredSize: number;
}

export interface IMoreSpecificResource {
    netname: string;
    resource: string;
    status: string;
    type: string;
    usage: IUsage;
}

@Injectable()
export class MoreSpecificsService {

    constructor(private http: HttpClient) {}

    public getSpecifics(objectName: string,
                        objectType: string,
                        page: number,
                        filter: string): Observable<IMoreSpecificsApiResult> {

        if (!objectType) {
            return throwError("objectType is empty. more-specifics not available");
        }
        if (!objectName) {
            return throwError("objectName is empty. more-specifics not available");
        }
        filter = filter ? filter.replace(/\s/g, "") : "";
        const params = new HttpParams()
            .set("filter", filter)
            .set("page", String(page));
        return this.http.get<IMoreSpecificsApiResult>(`api/whois-internal/api/resources/${objectType}/${objectName}/more-specifics.json`, {params});
    }
}
