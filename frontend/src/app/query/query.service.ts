import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, mergeMap, reduce} from "rxjs/operators";
import {Observable, of} from "rxjs";
import * as _ from "lodash";
import {IWhoisResponseModel} from "../shared/whois-response-type.model";
import {IQueryParameters} from "./query-parameters.service";
import {HierarchyFlagsService} from "./hierarchy-flags.service";
import {IpAddressService} from "../myresources/ip-address.service";
import {ObjectTypesEnum} from "./object-types.enum";
import {PropertiesService} from "../properties.service";

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
        if (resp.version) {
            acc.version = resp.version;
        }

        return acc;
    }

    public PAGE_SIZE: number = 20;

    constructor(private http: HttpClient,
                private propertiesService: PropertiesService) {
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
        } else if (qp.source !== "RIPE" && qp.source !== "RIPE-NONAUTH") {
            qp.source.split(/,/).forEach(s => params = params.append("source", s))
        }

        // calculate the flags
        let flags = qp.hierarchy || "";
        if (qp.reverseDomain) {
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
            const longFlag = HierarchyFlagsService.shortHierarchyFlagToLong(qp.hierarchy);
            if (longFlag) {
                linkParts.push("hierarchyFlag=" + longFlag);
            }
        }
        if (qp.reverseDomain) {
            linkParts.push("dflag=true");
        }
        linkParts.push("rflag=" + qp.doNotRetrieveRelatedObjects);
        if (!_.isUndefined(qp.source)) {
            qp.source.split(/,/).forEach(s => linkParts.push("source=" + s));
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
            const f = HierarchyFlagsService.shortHierarchyFlagToLong(qp.hierarchy);
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
        if (!_.isUndefined(qp.source)) {
            qp.source.split(/,/).forEach(s => {
              if (s.toUpperCase() === "GRS") {
                linkParts.push("flags=" + "resource");
              } else {
                linkParts.push("source=" + s);
              }
            });
        }
        return linkParts.join("&");
    }

    public getTypesAppropriateToQuery(searchText: string): string[] {
        let types: string[] = [];
        const searchTerm = searchText.trim()
        const route = searchTerm.split("AS");
        if (IpAddressService.isValidIpv4(searchTerm)) {
            types.push(ObjectTypesEnum.INETNUM);
            types.push(ObjectTypesEnum.DOMAIN);
            types.push(ObjectTypesEnum.ROUTE);
        } else if (IpAddressService.isValidV6(searchTerm)) {
            types.push(ObjectTypesEnum.INET6NUM);
            types.push(ObjectTypesEnum.DOMAIN);
            types.push(ObjectTypesEnum.ROUTE6);
        } else if (searchTerm.endsWith(".in-addr.arpa") || searchTerm.endsWith(".ip6.arpa")) {
            types.push(ObjectTypesEnum.DOMAIN);
        } else if (IpAddressService.isValidIpv4(route[0]) && /^\d+$/.test(route[1])) {
            types.push(ObjectTypesEnum.ROUTE);
        } else if (IpAddressService.isValidV6(route[0]) && /^\d+$/.test(route[1])) {
            types.push(ObjectTypesEnum.ROUTE6);
        } else if (searchTerm.toUpperCase().startsWith("ORG-") && searchTerm.toUpperCase().endsWith(`-${this.propertiesService.SOURCE}`)) {
            types.push(ObjectTypesEnum.ORGANISATION);
            types.push(ObjectTypesEnum.PERSON);
            types.push(ObjectTypesEnum.ROLE);
        } else if (searchTerm.toUpperCase().endsWith(`-${this.propertiesService.SOURCE}`)) {
            types.push(ObjectTypesEnum.ORGANISATION);
            types.push(ObjectTypesEnum.PERSON);
            types.push(ObjectTypesEnum.ROLE);
        } else if (searchTerm.toUpperCase().endsWith("-MNT")) {
            types.push(ObjectTypesEnum.MNTNER);
        }
        if (types.length === 0) {
            types = Object.values(ObjectTypesEnum);
        }
        return types;
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
