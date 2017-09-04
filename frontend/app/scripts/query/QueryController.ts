class QueryController {

    public static $inject = ["$scope", "$state", "QueryParametersService"];

    // show/hide the warning: no objects match...
    public showWarning = false;

    public queryString = "";
    public showFullObjectDetails: boolean;
    public doNotRetrieveRelatedObjects: boolean;
    public source: string;
    public types: {};
    public hierarchy: string;
    public dflag: boolean;
    public inverse: {};
    public numResultsToShow = 20;
    public showScroller = true;

    public whoisResponse: IWhoisResponseModel;
    public results: IWhoisObjectModel[];

    constructor(private $scope: angular.IScope,
                private $state: angular.ui.IStateService,
                private queryParametersService: IQueryParametersService) {

        this.source = "RIPE";

        // sub-forms
        this.types = {};
        this.hierarchy = "";
        this.dflag = false;
        this.inverse = {};
        this.showFullObjectDetails = true;
        this.doNotRetrieveRelatedObjects = false;
    }

    public updateClicked(model: IWhoisObjectModel): void {
        let name = "";
        for (const pkAttr of model["primary-key"].attribute) {
            name += pkAttr.value;
        }
        const params = {
            name,
            objectType: model.type,
            source: model.source.id,
        };
        this.$state.go("webupdates.modify", params);
    }

    public searchClicked() {
        if (!this.queryString) {
            this.results = [];
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
        return this.queryParametersService
            .searchWhoisObjects(
                this.queryString,
                this.source,
                this.types,
                flags,
                this.inverse)
            .then(
                (response: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => this.handleWhoisSearch(response),
                () => this.handleWhoisSearchError());
    }

    public lastResultOnScreen() {
        if (this.results && this.numResultsToShow <= this.results.length) {
            this.numResultsToShow += 20;
            this.$scope.$apply();
        }
        if (this.results && this.numResultsToShow >= this.results.length) {
            this.showScroller = false;
            this.$scope.$apply();
        }
    }

    private handleWhoisSearch(response: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) {
        this.whoisResponse = response.data;
        this.results = response.data.objects.object;
        this.showWarning = !this.results || this.results.length === 0;
        this.showScroller = true;
    }

    private handleWhoisSearchError() {
        this.whoisResponse = null;
        this.results = [];
        this.showWarning = true;
    }

}

angular
    .module("dbWebApp")
    .controller("QueryController", QueryController);
