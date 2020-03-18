import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {tap, timeout} from "rxjs/operators";
import {IResourceModel} from "../resource-type.model";

@Injectable()
export class HierarchySelectorService {

    private cashHierarchy: string[];

    constructor(private http: HttpClient) {}

    public fetchParentResources(resource: IResourceModel, org: string): Observable<string[]> {
        if (!resource || !resource.resource || !resource.type) {
            console.error("Not a resource", resource);
            throw new TypeError("ResourcesDataService.fetchParentResource failed: not a resource");
        }
        if (this.cashHierarchy && this.cashHierarchy.includes(resource.resource)) {
            // console.debug("cashHierarchy", this.cashHierarchy.splice(0, this.cashHierarchy.indexOf(resource.resource)));
            return of(this.cashHierarchy.splice(0, this.cashHierarchy.indexOf(resource.resource)));
        }
        const type = resource.type;
        const key = resource.resource;
        const params = new HttpParams()
            .set("key", key)
            .set("org", org)
            .set("type", type);
        let hierarchy: string[];
        return this.http.get<string[]>("api/whois/hierarchy/parents-of", {params})
            .pipe(
                timeout(10000),
                tap(
                    (result: string[]) => this.cashHierarchy = result,
                    (error: any) => console.error("hierarchy parents-of error:" + JSON.stringify(error))
                ));
    }

    public getParent(child: string): string {
        return this.cashHierarchy[this.cashHierarchy.indexOf(child) - 1];
    }
}
