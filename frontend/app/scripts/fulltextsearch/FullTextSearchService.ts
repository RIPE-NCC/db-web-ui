class FullTextSearchService {

    public static $inject = ["$log", "$http"];

    constructor(private $log: angular.ILogService,
                private $http: angular.IHttpService) {
    }

    public doSearch(query: string,
                    start: number,
                    advanced: boolean,
                    advancedMode: string,
                    searchObjects: string[],
                    searchAttributes: string[]) {

        // TODO: parse stateParams to support PERMA link functionality

        const params: {
            q?: string;
            start?: number;
            hl?: boolean;
            facet?: boolean;
            format?: string;
            wt?: string;
        } = {};

        if (typeof query === "string") {
            if (!advanced) {
                params.q = this.createQuery(query, "all", [], []);
            } else {
                params.q = this.createQuery(query, advancedMode, searchObjects, searchAttributes);
            }
            params.start = start;
            params.hl = true;
            params.facet = true;
            params.format = "xml";
            params.wt = "json";
            return this.$http({
                method: "GET",
                url: "api/rest/fulltextsearch/select",
                params,
            });
        }
    }

    private createQuery(query: string,
                        advancedMode: string,
                        searchObjects: string[],
                        searchAttributes: string[]): string {

        // Main query input control
        const qmain: string[] = [];
        const splits = query.split(" ");
        if (splits.length > 1) {
            switch (advancedMode) {
                case "all":
                    qmain.push(splits.join(" AND "));
                    break;
                case "any":
                    qmain.push(splits.join(" OR "));
                    break;
                case "exact":
                    qmain.unshift("\"");
                    qmain.push(splits.join(" "));
                    qmain.push("\"");
                    break;
                default:
                    break;
            }
        } else {
            qmain.push(query);
        }
        qmain.unshift("(");
        qmain.push(")");

        const qadv: string[] = [];
        // Now the advanced controls
        if (searchObjects.length) {
            qadv.push(" AND (");
            for (let i = 0; i < searchObjects.length; i++) {
                if (i > 0) {
                    qadv.push(" OR ");
                }
                qadv.push("object-type:");
                qadv.push(searchObjects[i]);
            }
            qadv.push(")");
            if (searchAttributes.length) {
                const qattr: string[] = [];
                qattr.push("(");
                for (let j = 0; j < searchAttributes.length; j++) {
                    if (j > 0) {
                        qattr.push(" OR ");
                    }
                    qattr.push(searchAttributes[j]);
                    qattr.push(":");
                    qattr.push(qmain.join(""));
                }
                qattr.push(")");
                return qattr.join("") + qadv.join("");
            }
        }
        return qmain.join("") + qadv.join("");
    }
}

angular
    .module("dbWebApp")
    .service("FullTextSearchService", FullTextSearchService);
