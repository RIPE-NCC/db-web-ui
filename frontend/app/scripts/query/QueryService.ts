interface IQueryService {

    searchWhoisObjects(qp: QueryParameters): ng.IHttpPromise<IWhoisResponseModel>;

    buildPermalink(qp: QueryParameters): string;

    buildQueryStringForLink(qp: QueryParameters): string;

}

const EMPTY_MODEL: { data: IWhoisResponseModel} = {
    data: {
        errormessages: {errormessage: []},
        objects: {object: []},
    },
};

class QueryService implements IQueryService {

    public static $inject = ["$http", "$q"];

    private static accumulate(resp: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>,
                              acc: { data: IWhoisResponseModel}) {
        if (resp.data.objects) {
            acc.data.objects.object = acc.data.objects.object.concat(resp.data.objects.object);
        }
        if (resp.data.errormessages) {
            acc.data.errormessages.errormessage =
                acc.data.errormessages.errormessage.concat(resp.data.errormessages.errormessage);
        }
    }

    constructor(private $http: angular.IHttpService,
                private $q: ng.IQService) {
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

        const acc = angular.copy(EMPTY_MODEL);

        return config.params["query-string"]

            // put the first 5 terms into an array and trim them
            .split(";")
            .map((item: string) => item.trim())
            .filter((item: string, idx: number) => item.length && idx < 5)

            // build an array of promises
            .map((term: string) => {
                const conf = angular.copy(config);
                conf.params["query-string"] = term;
                return this.$http.get<IWhoisResponseModel>("api/whois/search", conf);
            })

            // execute each promise sequentially. can't do them in parallel or a 404 will reject the entire promise...
            .reduce((prev: ng.IHttpPromise<IWhoisResponseModel>,
                     curr: ng.IHttpPromise<IWhoisResponseModel>) => {
                return prev.then((resp: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                    QueryService.accumulate(resp, acc);
                    return curr;
                }, (resp: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                    // ... so catch every rejection and return normal data
                    QueryService.accumulate(resp, acc);
                    return curr;
                });
            }, this.$q.resolve(acc))
            .then((resp: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                QueryService.accumulate(resp, acc);
                return acc;
            }, (resp: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                QueryService.accumulate(resp, acc);
                return acc;
            });
    }

    public buildPermalink(qp: QueryParameters): string {
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
            const longFlag = QueryParameters.shortHierarchyFlagToLong(qp.hierarchy);
            if (longFlag) {
                linkParts.push("hierarchyFlag=" + longFlag);
            }
        }
        if (qp.reverseDomain) {
            linkParts.push("dflag=true");
        }
        if (qp.doNotRetrieveRelatedObjects) {
            linkParts.push("rflag=true");
        }
        if (qp.source) {
            linkParts.push("source=" + qp.source);
        }
        linkParts.push("bflag=" + qp.showFullObjectDetails);
        return linkParts.join("&");
    }

    public buildQueryStringForLink(qp: QueryParameters): string {
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

angular
    .module("dbWebApp")
    .service("QueryService", QueryService);
