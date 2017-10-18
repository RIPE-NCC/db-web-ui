class FullTextResultSummaryController {

    private static $inject = [
        "$scope",
    ];
    public tabledata: ResultSummary[];
    public rowClicked: (td: ResultSummary) => {};

    public total: number;

    constructor(private $scope: any) {
        $scope.$watch(() => this.tabledata, () => {
            let total = 0;
            for (const row of this.tabledata) {
                total += row.value;
            }
            this.total = total;
        });
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
