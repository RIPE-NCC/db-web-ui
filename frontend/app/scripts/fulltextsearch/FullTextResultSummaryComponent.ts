class FullTextResultSummaryController {

    public tabledata: ResultSummary[];
    public rowClicked: (td: ResultSummary) => {};

    public total: number;

    public $onInit() {
        let total = 0;
        for (const row of this.tabledata) {
            total += row.value;
        }
        this.total = total;
    }

}

angular.module("dbWebApp").component("fullTextResultSummary", {
    bindings: {
        rowClicked: "&?",
        tabledata: "<",
    },
    controller: FullTextResultSummaryController,
    templateUrl: "scripts/fulltextsearch/full-text-result-summary.html",
});
