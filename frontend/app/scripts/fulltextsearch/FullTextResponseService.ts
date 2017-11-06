class FullTextResponseService {

    public static $inject = ["$log"];

    constructor(private $log: angular.ILogService) {
    }

    public parseResponse(data: ISearchResponseModel) {
        const results = [];
        const hlMap = {};
        if (data.lsts.length < 2 || data.lsts[1].lst.name !== "highlighting") {
            this.$log.error("Results have no highlighting information");
            return {details: [], summary: []};
        }

        for (const doc of data.lsts[1].lst.lsts) {
            hlMap[doc.lst.name] = doc.lst.arrs
                .filter((arr) => arr.name !== "object-type")
                .map((arr) => {
                    return {name: arr.arr.name, value: arr.arr.str.value}
                });

        }
        for (const doc of data.result.docs) {
            const pk = this.getDocPk(doc.doc.strs);
            const attrMap = this.strsToAttributeMap(doc.doc.strs);
            const name = attrMap["object-type"];
            const value = attrMap[name];
            const lookupKey = attrMap["lookup-key"];
            // now find the highlighted results to show
            results.push({
                hls: hlMap[pk],
                lookupKey,
                name,
                value,
            });
        }
        const resultSummaries: IResultSummary[] = [];
        // check we've got some facets for the summaries
        if (data.lsts.length > 2 &&
            data.lsts[2].lst.name === "facet_counts" &&
            data.lsts[2].lst.lsts[0].lst.name === "facet_fields" &&
            data.lsts[2].lst.lsts[0].lst.lsts.length > 0) {
            const aggResultData = data.lsts[2].lst.lsts[0].lst.lsts[0].lst.ints;
            for (const doc of aggResultData) {
                resultSummaries.push({name: doc.int.name, value: parseInt(doc.int.value, 10)} as IResultSummary);
            }
        }
        return {details: results, summary: resultSummaries};
    }

    private getDocPk(strs: Array<{ str: { name: string; value: string } }>) {
        const pkAttr = strs.filter((str) => {
            return str.str.name === "primary-key";
        });
        return pkAttr[0].str.value;
    }

    private strsToAttributeMap(strs: any[]) {
        const attrMap = {};
        for (const str of strs) {
            attrMap[str.str.name] = str.str.value;
        }
        return attrMap;
    }

}

angular
    .module("dbWebApp")
    .service("FullTextResponseService", FullTextResponseService);
