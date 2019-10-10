import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {timeout} from "rxjs/operators";
import {IMoreSpecificsApiResult} from "./more-specifics.service";
import {
    IIpv4Analysis,
    IIPv4ResourcesResponse,
    IIPv6ResourcesResponse,
    IResourceModel,
    IResourceOverviewResponseModel, IResourceTickets
} from "./resource-type.model";

@Injectable()
export class ResourcesDataService {

    constructor(private http: HttpClient) {
    }

    public fetchParentResources(resource: IResourceModel, org: string): Observable<string[]> {
        if (!resource || !resource.resource || !resource.type) {
            console.error("Not a resource", resource);
            throw new TypeError("ResourcesDataService.fetchParentResource failed: not a resource");
        }
        const type = resource.type;
        const key = resource.resource;
        const params = new HttpParams()
            .set("key", key)
            .set("org", org)
            .set("type", type);
        return this.http.get<string[]>("api/whois/hierarchy/parents-of", {params})
            .pipe(timeout(10000));
    }

    public fetchResource(objectName: string, type: string): Observable<IMoreSpecificsApiResult> {
        return this.http.get<IMoreSpecificsApiResult>(`api/whois-internal/api/resources/${type}/${objectName}`);
    }

    public fetchIpv4Resource(objectName: string): Observable<IIPv4ResourcesResponse> {
        return this.http.get<IIPv4ResourcesResponse>(`api/whois-internal/api/resources/inetnum/${objectName}`);
    }

    public fetchIpv6Resource(objectName: string): Observable<IIPv6ResourcesResponse> {
        return this.http.get<IIPv4ResourcesResponse>(`api/whois-internal/api/resources/inet6num/${objectName}`);
    }

    public fetchResources(orgId: string,
                          resourceType: string,
                          sponsored: boolean): Observable<IResourceOverviewResponseModel> {
        if (!resourceType) {
            console.error("fetchResources failed. No resourceType given");
            return;
        }
        const params = new HttpParams()
            .set(sponsored ? "sponsoring-org-id": "org-id", orgId)
            .set("type", resourceType);
        return this.http.get<IResourceOverviewResponseModel>("api/whois-internal/api/resources", {params})
            .pipe(timeout(60000));
    }

    public fetchIpv4Analysis(orgId: string): Observable<IIpv4Analysis> {
        const params = new HttpParams()
            .set("org-id", orgId);
        return this.http.get<IIpv4Analysis>("api/whois-internal/api/resources/ipanalyser/ipv4.json", {params})
            .pipe(timeout(30000));
    }

    public fetchTicketsAndDates(orgId: string, resource: string): Observable<IResourceTickets> {
        return this.http.get<IResourceTickets>(`api/ba-apps/resources/${orgId}/${resource}`);
    }
}
