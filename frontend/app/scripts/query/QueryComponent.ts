interface IQueryState extends ng.ui.IStateParamsService {
    source: string;
    searchtext: string;
    inverse: string;
    types: string;
    bflag: string;
    dflag: string;
    rflag: string;
    hierarchyFlag: string;
}

interface IProperties {
    // only here to stop tslint from whinging
    REST_SEARCH_URL: string;
    SOURCE: string;
    LOGIN_URL: string;
}

class QueryController {

    public static $inject = [
        "$location",
        "$scope",
        "$state",
        "$stateParams",
        "Labels",
        "Properties",
        "QueryService",
    ];

    public qp: QueryParameters;

    public numResultsToShow = 20;
    public showScroller = true;
    public results: IWhoisObjectModel[];
    public errorMessages: IErrorMessageModel[];

    public link: {
        json: string;
        perma: string;
        xml: string;
    };

    constructor(private $location: angular.ILocationService,
                private $scope: angular.IScope,
                private $state: angular.ui.IStateService,
                private $stateParams: IQueryState,
                private labels: { [key: string]: string },
                private properties: IProperties,
                private service: IQueryService) {

        this.qp = new QueryParameters();
        this.qp.source = this.$stateParams.source || this.properties.SOURCE;
        this.link = {
            json: "",
            perma: "",
            xml: "",
        };

        this.qp.types = this.$stateParams.types
            ? this.convertListToMapOfBools(this.$stateParams.types.split(";"))
            : {};
        this.qp.inverse = this.$stateParams.inverse
            ? this.convertListToMapOfBools(this.$stateParams.inverse.split(";"))
            : {};
        this.qp.hierarchy = QueryParameters.longHierarchyFlagToShort(this.$stateParams.hierarchyFlag);
        this.qp.reverseDomain = this.flagToBoolean(this.$stateParams.dflag, false); // -d
        this.qp.showFullObjectDetails = this.flagToBoolean(this.$stateParams.bflag, true); // -B
        this.qp.doNotRetrieveRelatedObjects = this.flagToBoolean(this.$stateParams.rflag, false); // -r
        this.qp.queryText = (this.$stateParams.searchtext || "").trim();
        if (this.qp.queryText) {
            this.doSearch();
        }
    }

    public submitSearchForm() {
        this.$location.search(this.qp.asLocationSearchParams());
    }

    public updateClicked(model: IWhoisObjectModel): void {
        const name = model["primary-key"].attribute.map((attr) => attr.value).join("");
        const params = {
            name,
            objectType: model.type,
            source: model.source.id,
        };
        this.$state.go("webupdates.modify", params);
    }

    public doSearch() {
        if (!this.qp.queryText) {
            this.results = [];
            return;
        }
        // Reset on-screen widgets
        this.errorMessages = [];
        this.results = [];
        return this.service
            .searchWhoisObjects(this.qp)
            .then(
                (response) => this.handleWhoisSearch(response),
                (error) => this.handleWhoisSearchError(error));
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

    public whoisCliQuery(): string {
        if (!this.qp.queryText || this.qp.queryText.indexOf(";") > -1) {
            return " ";
        }
        const q = [];
        const invs = this.qp.inverseAsList().join(",");
        const typs = this.qp.typesAsList().join(",");
        if (invs.length) {
            q.push("-i ");
            q.push(invs);
        }
        if (typs.length) {
            q.push(" -T ");
            q.push(typs);
        }
        let flags = this.qp.hierarchy || "";
        if (this.qp.reverseDomain && flags) {
            flags += "d";
        }
        if (this.qp.showFullObjectDetails) {
            flags += "B";
        }
        if (this.qp.doNotRetrieveRelatedObjects) {
            flags += "r";
        }
        if (flags) {
            q.push(" -" + flags);
        }
        if (this.qp.source === "GRS") {
            q.push(" --resource");
        }
        q.push(" " + this.qp.queryText);
        return q.join("").trim();
    }

    // Move this to a util service and test it properly, i.e. with all expected message variants
    public formatError(msg: IErrorMessageModel) {
        const parts = msg.text.split(/%[a-z]/);
        const resultArr = [];
        if (parts.length < 2 || parts.length !== msg.args.length + 1) {
            return msg.text;
        }
        resultArr.push(parts[parts.length - 1]);
        for (let i = parts.length - 2; i >= 0; i--) {
            resultArr.push(msg.args[i].value);
            resultArr.push(parts[i]);
        }
        return resultArr.reverse().join("").trim().replace(/\n/g, "<br>");
    }

    private handleWhoisSearch(response: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) {
        this.results = response.data.objects.object;
        // multiple term searches can have errors, too
        const msgs = response.data.errormessages && response.data.errormessages.errormessage;
        if (msgs && msgs.length > 0) {
            this.errorMessages = msgs;
        }
        this.showScroller = true;

        const jsonQueryString = this.service.buildQueryStringForLink(this.qp);
        if (jsonQueryString) {
            this.link.perma = "#/query?" + this.service.buildPermalink(this.qp);
            this.link.json = this.properties.REST_SEARCH_URL + "search.json?" + jsonQueryString;
            this.link.xml = this.properties.REST_SEARCH_URL + "search.xml?" + jsonQueryString;
        } else {
            this.link.perma = this.link.json = this.link.xml = "";
        }
    }

    private handleWhoisSearchError(response: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) {
        this.results = response.data.objects ? response.data.objects.object : [];
        const msgs = response.data.errormessages && response.data.errormessages.errormessage;
        if (msgs && msgs.length > 0) {
            this.errorMessages = msgs;
        }
    }

    private convertListToMapOfBools(list: string[]) {
        const map = {};
        if (angular.isArray(list)) {
            for (const l of list) {
                map[l.replace(/-/g, "_").toLocaleUpperCase()] = true;
            }
        }
        return map;
    }

    private flagToBoolean(flag: string, def: boolean): boolean {
        if (typeof flag !== "string") {
            return def;
        }
        return flag.toLowerCase() === "true";
    }
}

angular.module("dbWebApp").component("query", {
    controller: QueryController,
    templateUrl: "scripts/query/query.html",
});