
class QueryController {
    public static $inject = ["$log", "QueryParametersService"];

    // show/hide the warning: no objects match...
    public showWarning = false;

    public queryString: string;
    public showFullObjectDetails: boolean;
    public doNotRetrieveRelatedObjects: boolean;
    public source: string;
    public types: {};
    public hierarchy: string;
    public dflag: boolean;
    public inverse: {};

    public whoisResponse: IWhoisResponseModel;
    public results: IWhoisObjectModel[];

    constructor(private $log: angular.ILogService,
                private queryParametersService: IQueryParametersService) {
        this.queryString = "";
        this.showFullObjectDetails = true;
        this.doNotRetrieveRelatedObjects = false;
        this.source = "RIPE";

        // sub-forms
        this.types = {};
        this.hierarchy = "";
        this.dflag = false;
        this.inverse = {};
    }

    public searchClicked(): void {
        if (!this.queryString) {
            return;
        }
        // Reset on-screen widgets
        this.showWarning = false;
        this.results = [];

        // calculate the flags
        let flags = this.hierarchy || "";
        if (this.dflag && flags) {
            flags += "d";
        }
        if (this.showFullObjectDetails) {
            flags += "B";
        }
        if (this.doNotRetrieveRelatedObjects) {
            flags += "r";
        }
        this.queryParametersService.searchWhoisObjects(
            this.queryString,
            this.source,
            this.types,
            flags,
            this.inverse).then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                this.results = response.data.objects.object;
                this.showWarning = !this.results || this.results.length === 0;
                this.$log.debug("Set results: ", this.results);
            }, () => {
                this.whoisResponse = null;
                this.results = [];
                this.showWarning = true;
            });
    }

}

angular
    .module("dbWebApp")
    .controller("QueryController", QueryController);
