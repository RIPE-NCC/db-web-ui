import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, mergeMap, reduce} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {IWhoisResponseModel} from "../shared/whois-response-type.model";
import {IQueryParameters, QueryParametersService} from "./query-parameters.service";

const EMPTY_MODEL: IWhoisResponseModel = {
    errormessages: {errormessage: []},
    objects: {object: []},
};

@Injectable()
export class QueryService {

    private accumulate(resp: IWhoisResponseModel,
                       acc: IWhoisResponseModel): IWhoisResponseModel {
        if (resp.objects) {
            acc.objects.object = acc.objects.object.concat(resp.objects.object);
        }
        if (resp.errormessages) {
            acc.errormessages.errormessage =
                acc.errormessages.errormessage.concat(resp.errormessages.errormessage);
        }

        return acc;
    }

    public PAGE_SIZE: number = 20;

    constructor(private http: HttpClient) {
    }

    // this is request to whois library and response is not json that's why {responseType: "text" as "json"}
    public searchTemplate(objectType: string): Observable<string> {
        return this.http.get<string>(`api/metadata/templates/${objectType}`, {responseType: "text" as "json"});
    }

    public searchVerbose(objectType: string): Observable<string> {
        return this.http.get<string>(`api/metadata/verboses/${objectType}`, {responseType: "text" as "json"});
    }

    public searchWhoisObjects(qp: IQueryParameters, offset?: number): Observable<IWhoisResponseModel> {
        const typeFilter = qp.types ? Object.keys(qp.types).filter((type) => qp.types[type]).join(",") : "";
        const inverseFilter = qp.inverse ? Object.keys(qp.inverse).filter((inv) => qp.inverse[inv]).join(",") : "";
        let params = new HttpParams()
            .set("abuse-contact", String(true))
            .set("ignore404", String(true))
            .set("managed-attributes", String(true))
            .set("resource-holder", String(true));

        if (typeFilter) {
            params = params.set("type-filter", typeFilter.replace(/_/g, "-"));
        }
        if (inverseFilter) {
            params = params.set("inverse-attribute", inverseFilter.replace(/_/g, "-"));
        }

        if (qp.source === "GRS") {
            params = params.set("flags", "resource");
        }

        // calculate the flags
        let flags = qp.hierarchy || "";
        if (qp.reverseDomain && flags) {
            flags += "d";
        }
        if (qp.doNotRetrieveRelatedObjects) {
            flags += "r";
        }
        if (qp.showFullObjectDetails) {
            flags += "B";
        }

        if (flags) {
            params = params.append("flags", flags);
        }

        const acc = _.cloneDeep(EMPTY_MODEL);

        // paging:
        params = params.set("offset", String(offset))
            .set("limit", String(this.PAGE_SIZE));
        const terms: string[] = qp.queryText
        // put the first 5 terms into an array and trim them
            .split(";")
            .map((item: string) => item.trim())
            .filter((item: string, idx: number) => item.length && idx < 5);
        // build an array of promises
        return of(...terms)
            .pipe(
                mergeMap(term => {
                        params = params.set("query-string", term);
                        return this.http.get<IWhoisResponseModel>("api/whois/search", {params})
                            .pipe(catchError(err => of(err.error)))
                    },
                5),
                reduce((acc, result) => this.accumulate(result, acc), acc)
            );

    }

    public buildPermalink(qp: IQueryParameters): string {
        if (!qp.queryText || !qp.queryText.trim() || qp.queryText.indexOf(";") > -1) {
            return "";
        }
        const linkParts: string[] = [];
        linkParts.push("searchtext=" + qp.queryText.trim());

        const invs = this.convertMapOfBoolsToList(qp.inverse);
        if (invs.length > 0) {
            linkParts.push("inverse=" + invs.join(";"));
        }
        const typs = this.convertMapOfBoolsToList(qp.types);
        if (typs.length > 0) {
            linkParts.push("types=" + typs.join(";"));
        }
        if (qp.hierarchy) {
            const longFlag = QueryParametersService.shortHierarchyFlagToLong(qp.hierarchy);
            if (longFlag) {
                linkParts.push("hierarchyFlag=" + longFlag);
            }
        }
        if (qp.reverseDomain) {
            linkParts.push("dflag=true");
        }
        linkParts.push("rflag=" + qp.doNotRetrieveRelatedObjects);
        if (qp.source) {
            linkParts.push("source=" + qp.source);
        }
        linkParts.push("bflag=" + qp.showFullObjectDetails);
        return linkParts.join("&");
    }

    public buildQueryStringForLink(qp: IQueryParameters): string {
        if (!qp.queryText || !qp.queryText.trim() || qp.queryText.indexOf(";") > -1) {
            return "";
        }
        const linkParts: string[] = [];
        linkParts.push("query-string=" + qp.queryText.trim());

        if (qp.inverse) {
            const invs = this.convertMapOfBoolsToList(qp.inverse);
            for (const inv of invs) {
                linkParts.push("inverse-attribute=" + inv);
            }
        }
        if (qp.types) {
            const typs = this.convertMapOfBoolsToList(qp.types);
            for (const typ of typs) {
                linkParts.push("type-filter=" + typ);
            }
        }
        if (qp.hierarchy) {
            const f = QueryParametersService.shortHierarchyFlagToLong(qp.hierarchy);
            if (f) {
                linkParts.push("flags=" + f);
            }
        }
        if (qp.reverseDomain) {
            linkParts.push("flags=reverse-domain");
        }
        if (qp.doNotRetrieveRelatedObjects) {
            linkParts.push("flags=no-referenced");
            linkParts.push("flags=no-irt"); // what's this doing here?
        }
        if (qp.showFullObjectDetails) {
            linkParts.push("flags=no-filtering");
        }
        if (qp.source) {
            linkParts.push("source=" + qp.source);
        }

        return linkParts.join("&");

    }

    private convertMapOfBoolsToList(boolMap: { [key: string]: boolean }): string[] {
        if (!boolMap || typeof boolMap !== "object") {
            return [];
        }
        return Object.keys(boolMap)
            .filter((key) => boolMap[key])
            .map((obj) => {
                return obj.replace(/_/g, "-").toLocaleLowerCase();
            });
    }
}
