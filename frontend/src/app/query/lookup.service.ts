import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {throwError} from "rxjs";
import {IWhoisResponseModel} from "../shared/whois-response-type.model";

export interface ILookupState {
    source: string;
    type: string;
    key: string;
}

interface ILookupService {
    lookupWhoisObject(params: ILookupState): Promise<IWhoisResponseModel>;
}

@Injectable()
export class LookupService implements ILookupService {

    constructor(private http: HttpClient) {}

    public lookupWhoisObject(lookupState: ILookupState): Promise<any> {// Promise<IWhoisResponseModel> {
        if (!lookupState.key || !lookupState.source || !lookupState.type) {
            return throwError("Not a valid ILookupState").toPromise();
        }
        const url = `api/whois/${lookupState.source}/${lookupState.type}/${lookupState.key}`;

        const params = new HttpParams()
            .set("abuse-contact", String(true))
            .set("managed-attributes", String(true))
            .set("resource-holder", String(true))
            .set("unfiltered", String(true));
        return this.http.get<IWhoisResponseModel>(url, {params}).toPromise();
    }
}
