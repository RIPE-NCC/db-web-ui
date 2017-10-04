interface IQueryService {

    searchWhoisObjects(qp: QueryParameters): ng.IHttpPromise<IWhoisResponseModel>;

    convertMapOfBoolsToList(boolMap: { [key: string]: boolean }): string[];

    buildPermalink(qp: QueryParameters): string;

    buildQueryStringForLink(qp: QueryParameters): string;

    convertListToMapOfBools(list: string[]): { [key: string]: boolean };
}

class QueryService implements IQueryService {

    public static $inject = ["$http"];

    constructor(private $http: angular.IHttpService) {
    }

    public searchWhoisObjects(qp: QueryParameters): ng.IHttpPromise<IWhoisResponseModel> {

        const typeFilter = qp.types ? Object.keys(qp.types).filter((type) => qp.types[type]).join(",") : "";
        const inverseFilter = qp.inverse ? Object.keys(qp.inverse).filter((inv) => qp.inverse[inv]).join(",") : "";
        const config: angular.IRequestShortcutConfig = {};
        config.params = {
            "abuse-contact": true,
            "ignore404": true,
            "managed-attributes": true,
            "query-string": qp.queryText,
            "resource-holder": true,
        };
        if (typeFilter) {
            config.params["type-filter"] = typeFilter.replace(/_/g, "-");
        }
        if (inverseFilter) {
            config.params["inverse-attribute"] = inverseFilter.replace(/_/g, "-");
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
        config.params.flags = qp.source === "GRS" ? flags ? ["resource", flags] : ["resource"] : flags;
        return this.$http.get("api/whois/search", config);
    }

    public buildPermalink(qp: QueryParameters): string {

        const linkParts: string[] = [];
        if (qp.queryText && qp.queryText.trim()) {
            linkParts.push("searchtext=" + qp.queryText.trim());
        }
        if (qp.inverse) {
            const invs = this.convertMapOfBoolsToList(qp.inverse);
            if (invs.length > 0) {
                linkParts.push("inverse=" + invs.join(";"));
            }
        }
        if (qp.types) {
            const typs = this.convertMapOfBoolsToList(qp.types);
            if (typs.length > 0) {
                linkParts.push("types=" + typs.join(";"));
            }
        }
        if (qp.hierarchy) {
            linkParts.push("hierarchyFlag=" + QueryParameters.shortHierarchyFlagToLong(qp.hierarchy));
        }
        if (qp.reverseDomain) {
            linkParts.push("dflag=true");
        }
        if (qp.doNotRetrieveRelatedObjects) {
            linkParts.push("rflag=true");
        }
        if (qp.showFullObjectDetails) {
            linkParts.push("bflag=true");
        }
        if (qp.source) {
            linkParts.push("source=" + qp.source);
        }

        return linkParts.join("&");
    }

    public buildQueryStringForLink(qp: QueryParameters): string {
        // TODO hierarchy flag
        const linkParts: string[] = [];
        if (qp.queryText && qp.queryText.trim()) {
            linkParts.push("query-string=" + qp.queryText.trim());
        }
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
            const f = QueryParameters.shortHierarchyFlagToLong(qp.hierarchy);
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

    public convertMapOfBoolsToList(boolMap: { [key: string]: boolean }): string[] {
        return Object.keys(boolMap)
            .filter((key) => boolMap[key])
            .map((obj) => {
                return obj.replace(/_/g, "-").toLocaleLowerCase();
            });
    }

    public convertListToMapOfBools(list: string[]) {
        const map = {};
        if (list && list.length) {
            for (const l of list) {
                map[l.replace("-", "_").toLocaleUpperCase()] = true;
            }
        }
        return map;
    }

}

angular
    .module("dbWebApp")
    .service("QueryService", QueryService);
