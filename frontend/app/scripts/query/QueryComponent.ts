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
    LOGOUT_URL: string;
    BUILD_TAG: string;
    PORTAL_URL: string;

    LIR_ACCOUNT_DETAILS_URL: string;
    LIR_BILLING_DETAILS_URL: string;
    REQUEST_UPDATE_URL: string;
    LIR_GENERAL_MEETING_URL: string;
    LIR_USER_ACCOUNTS_URL: string;
    LIR_TICKETS_URL: string;
    LIR_TRAINING_URL: string;
    LIR_API_ACCESS_KEYS_URL: string;
    OPEN_ACQUISITION_URL: string;

    REQUEST_RESOURCES_URL: string;
    REQUEST_TRANSFER_URL: string;
    IPV4_TRANSFER_LISTING_URL: string;
    RPKI_DASHBOARD_URL: string;

    DATABASE_FULL_TEXT_SEARCH_URL: string;
    DATABASE_SYNCUPDATES_URL: string;
    DATABASE_CREATE_URL: string;

    ENV: string;
}

class QueryController {

    public static $inject = [
        "$location",
        "$scope",
        "$state",
        "$stateParams",
        "Properties",
        "QueryService",
        "$anchorScroll",
        "QueryParameters",
    ];

    public qp: QueryParameters;

    public offset = 0;
    public showScroller = false;
    public results: IWhoisObjectModel[];
    public errorMessages: IErrorMessageModel[];

    public showTemplatePanel: boolean;
    public queriedTemplateObject: ITemplateTerm;

    public link: {
        json: string;
        perma: string;
        xml: string;
    };

    constructor(private $location: angular.ILocationService,
                private $scope: angular.IScope,
                private $state: angular.ui.IStateService,
                private $stateParams: IQueryState,
                private properties: IProperties,
                private service: IQueryService,
                private $anchorScroll: ng.IAnchorScrollService,
                private QueryParameters: QueryParameters) {

        this.qp = QueryParameters;
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
        // on page refresh or in case of bookmarked page
        if (this.qp.queryText) {
            this.doSearch();
        }
    }

    public submitSearchForm() {
        const formQueryParam = this.qp.asLocationSearchParams();
        this.$location.search(formQueryParam);
        // when query param doesn't change $location doesn't make search
        if (this.equalsQueryParameters(formQueryParam, this.$stateParams)) {
            this.clearResults();
            this.doSearch();
        }
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
            this.clearResults();
            return;
        }
        const cleanQp: QueryParameters = angular.copy(this.qp);
        // Reset on-screen widgets
        this.errorMessages = [];

        const issues = cleanQp.validate();
        for (const msg of issues.warnings) {
            const err: IErrorMessageModel = {
                severity: "warning",
                text: msg,
            };
            this.errorMessages.push(err);
        }
        for (const msg of issues.errors) {
            const err: IErrorMessageModel = {
                severity: "error",
                text: msg,
            };
            this.errorMessages.push(err);
        }
        if (issues.errors.length) {
            this.gotoAnchor();
            return;
        }

        if (this.qp.isQueriedTemplate()) {
            this.showTemplatePanel = issues.errors.length === 0;
            this.queriedTemplateObject = cleanQp.queriedTemplateObject;
        } else {
            this.service
                .searchWhoisObjects(cleanQp, this.offset)
                .then(
                    (response) => {
                        this.handleWhoisSearch(response);
                    },
                    (error) => this.handleWhoisSearchError(error));
        }
    }

    public lastResultOnScreen() {
        if (this.showScroller && this.results) {
            this.offset += this.service.PAGE_SIZE;
            this.doSearch();
        }
    }

    public whoisCliQuery(): string {
        if (!this.qp.queryText || this.qp.queryText.indexOf(";") > -1) {
            return " ";
        }
        const qpClean = angular.copy(this.qp);
        if (qpClean.validate().errors.length > 0) {
            return " ";
        }
        if (qpClean.isQueriedTemplate()) {
            return qpClean.queryText;
        }
        const q = [];
        const invs = qpClean.inverseAsList().join(",");
        const typs = qpClean.typesAsList().join(",");
        if (invs.length) {
            q.push("-i ");
            q.push(invs);
        }
        if (typs.length) {
            q.push(" -T ");
            q.push(typs);
        }
        let flags = qpClean.hierarchy || "";
        if (qpClean.reverseDomain && flags) {
            flags += "d";
        }
        if (qpClean.showFullObjectDetails) {
            flags += "B";
        }
        if (qpClean.doNotRetrieveRelatedObjects) {
            flags += "r";
        }
        if (flags) {
            q.push(" -" + flags);
        }
        if (qpClean.source === "GRS") {
            q.push(" --resource");
        }
        q.push(" " + qpClean.queryText);
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
        if (this.results) {
            this.results = this.results.concat(response.data.objects.object);
        } else {
            this.results = response.data.objects.object;
        }

        // multiple term searches can have errors, too
        const msgs = response.data.errormessages && response.data.errormessages.errormessage;
        if (msgs && msgs.length > 0) {
            this.errorMessages = msgs;
        }
        const qpClean = angular.copy(this.qp);

        qpClean.validate();
        const jsonQueryString = this.service.buildQueryStringForLink(qpClean);
        if (jsonQueryString) {
            this.link.perma = "#/query?" + this.service.buildPermalink(this.qp);
            this.link.json = this.properties.REST_SEARCH_URL + "search.json?" + jsonQueryString;
            this.link.xml = this.properties.REST_SEARCH_URL + "search.xml?" + jsonQueryString;
        } else {
            this.link.perma = this.link.json = this.link.xml = "";
        }
        if (this.offset === 0) {
            this.gotoAnchor();
        }
        this.showScroller = response.data.objects.object.length === this.service.PAGE_SIZE;
    }

    private handleWhoisSearchError(response: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) {
        this.results = response.data.objects ? response.data.objects.object : [];
        const msgs = response.data.errormessages && response.data.errormessages.errormessage;
        if (msgs && msgs.length > 0) {
            this.errorMessages = msgs;
        }
        this.gotoAnchor();
    }

    private clearResults() {
        this.results = [];
        this.offset = 0;
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

    private equalsQueryParameters(formQueryParam: IQueryState, stateParams: IQueryState): boolean {
        return stateParams
            && formQueryParam.source === stateParams.source
            && this.equalsItemsInString(formQueryParam.types, stateParams.types)
            && this.equalsItemsInString(formQueryParam.inverse, stateParams.inverse)
            && formQueryParam.hierarchyFlag === this.$stateParams.hierarchyFlag
            && formQueryParam.dflag === this.$stateParams.dflag
            && formQueryParam.bflag === this.$stateParams.bflag
            && formQueryParam.rflag === this.$stateParams.rflag
            && formQueryParam.searchtext === this.$stateParams.searchtext;
    }

    private equalsItemsInString(formQueryParamItems: string, stateParamItems: string): boolean {
        const listFormItems = formQueryParamItems ? formQueryParamItems.split(";") : formQueryParamItems;
        const listStateItems = stateParamItems ? stateParamItems.split(";") : stateParamItems;
        return _.difference(listFormItems, listStateItems).length === 0;
    }

    private gotoAnchor() {
        if (this.errorMessages && this.errorMessages.length > 0) {
            this.setActiveAnchor("anchorTop");
        } else {
            this.setActiveAnchor("resultsSection");
        }
    }

    private setActiveAnchor(id: string) {
        this.$location.hash(id);
        this.$anchorScroll();
    }
}

angular.module("dbWebApp").component("query", {
    controller: QueryController,
    templateUrl: "./query.html",
});
