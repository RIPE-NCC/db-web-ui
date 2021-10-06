import {Component, OnDestroy} from "@angular/core";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {ViewportScroller} from '@angular/common';
import * as _ from "lodash";
import {IErrorMessageModel, IVersion, IWhoisObjectModel, IWhoisResponseModel} from "../shared/whois-response-type.model";
import {IQueryParameters, ITemplateTerm, QueryParametersService} from "./query-parameters.service";
import {QueryService} from "./query.service";
import {PropertiesService} from "../properties.service";
import {AlertsService} from "../shared/alert/alerts.service";
import {HierarchyFlagsService} from "./hierarchy-flags.service";

export interface IQueryState {
    source: string;
    searchtext: string;
    inverse: string;
    types: string;
    bflag: string;
    dflag: string;
    rflag: string;
    hierarchyFlag: string;
}

@Component({
    selector: "query",
    templateUrl: "./query.component.html",
})
export class QueryComponent implements OnDestroy {

    public offset = 0;
    public showScroller = false;
    public results: IWhoisObjectModel[];
    public whoisVersion: IVersion;
    public active = 1;

    public qp: IQueryParameters;
    public showTemplatePanel: boolean;
    public queriedTemplateObject: ITemplateTerm;
    public subscription: any;
    public link: {
        json: string;
        perma: string;
        xml: string;
    };
    public showsQueryFlagsContainer: boolean;

    constructor(public properties: PropertiesService,
                private queryService: QueryService,
                private queryParametersService: QueryParametersService,
                public alertsService: AlertsService,
                private viewportScroller: ViewportScroller,
                public activatedRoute: ActivatedRoute,
                public router: Router) {
        this.qp = {
            queryText: "",
            types: {},
            inverse: {},
            hierarchy: "",
            reverseDomain: false,
            doNotRetrieveRelatedObjects: false,
            showFullObjectDetails: false,
            source: ""
        };
        this.subscription = this.activatedRoute.queryParams.subscribe((() => {
            if (this.alertsService) {
                this.alertsService.clearAlertMessages();
            }
            this.init();
        }));
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public init() {
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.qp.source = queryParamMap.has("source") ? queryParamMap.getAll("source").join(",")
            : this.properties.SOURCE;
        this.link = {
            json: "",
            perma: "",
            xml: "",
        };

        this.qp.types = queryParamMap.get("types")
            ? this.convertListToMapOfBools(queryParamMap.get("types").split(";"))
            : {};
        this.qp.inverse = queryParamMap.get("inverse")
            ? this.convertListToMapOfBools(queryParamMap.get("inverse").split(";"))
            : {};
        this.qp.hierarchy = HierarchyFlagsService.longHierarchyFlagToShort(queryParamMap.get("hierarchyFlag"));
        this.qp.reverseDomain = this.flagToBoolean(queryParamMap.get("dflag"), false); // -d
        this.qp.showFullObjectDetails = this.flagToBoolean(queryParamMap.get("bflag"), false); // -B
        this.qp.doNotRetrieveRelatedObjects = this.flagToBoolean(queryParamMap.get("rflag"), true); // -r
        this.qp.queryText = (queryParamMap.has("searchtext") ? queryParamMap.get("searchtext") : "").trim();
        // on page refresh or in case of bookmarked page
        if (this.qp.queryText) {
            this.clearResults();
            this.doSearch();
        }
        // in case click on lefthand menu, no queryText then refresh result array or hide template panel
        if (this.qp.queryText === "") {
            this.clearResults();
            this.showTemplatePanel = false;
        }
    }

    public submitSearchForm() {
        const formQueryParam = this.queryParametersService.asLocationSearchParams(this.qp);
        // when query param doesn't change $location doesn't make search
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        if (this.equalsQueryParameters(formQueryParam, queryParamMap)) {
            this.clearResults();
            this.doSearch();
        } else {
            this.router.navigate(["query"], {queryParams: formQueryParam});
        }
    }

    public updateClicked(model: IWhoisObjectModel): void {
        const name = model["primary-key"].attribute.map((attr) => attr.value).join("");
        this.router.navigate(["webupdates/modify", model.source.id, model.type, name]);
    }

    public uncheckReverseDomain() {
        this.qp.reverseDomain = false;
    }

    public doSearch() {
        if (!this.qp.queryText) {
            this.clearResults();
            return;
        }
        const cleanQp = _.cloneDeep(this.qp);
        // Reset on-screen widgets
        this.alertsService.clearAlertMessages();

        const issues = this.queryParametersService.validate(cleanQp);
        for (const msg of issues.warnings) {
            const war: IErrorMessageModel = {
                severity: "warning",
                plainText: msg,
            };
            this.alertsService.addGlobalWarning(this.formatError(war));
        }
        for (const msg of issues.errors) {
            const err: IErrorMessageModel = {
                severity: "error",
                plainText: msg,
            };
            this.alertsService.addGlobalError(this.formatError(err));
        }
        if (issues.errors.length) {
            this.gotoAnchor();
            return;
        }

        if (QueryParametersService.isQueriedTemplate(cleanQp.queryText)) {
            this.showTemplatePanel = issues.errors.length === 0;
            this.queriedTemplateObject = cleanQp.queriedTemplateObject;
            setTimeout(() => this.gotoAnchor(),0) ;
        } else {
            this.showTemplatePanel = false;
            this.queryService
                .searchWhoisObjects(cleanQp, this.offset)
                .subscribe((response: IWhoisResponseModel) => {
                        this.handleWhoisSearch(response);
                        if (this.offset === 0) {
                            setTimeout(() => this.gotoAnchor(),0) ;
                        }
                    },
                    (error: IWhoisResponseModel) => this.handleWhoisSearchError(error));
        }
    }

    public lastResultOnScreen() {
        if (this.showScroller && this.results) {
            this.offset += this.queryService.PAGE_SIZE;
            this.doSearch();
        }
    }

    public isShownQueryFlagsContainer(event: boolean) {
        this.showsQueryFlagsContainer = event;
    }

    public countSelectedDropdownItems(list) {
        let numberSelected = Object.keys(list).filter(element => list[element] === true).length;
        return numberSelected > 0 ? `(${numberSelected})` : "";
    }

    public countSelectedDropdownHierarchyFlags() {
        return !!this.qp.hierarchy && this.qp.hierarchy !== HierarchyFlagsService.hierarchyFlagMap[0].short
            ? this.qp.reverseDomain ? "(2)" : "(1)"
            : "";
    }

    public countSelectedDropdownAdvanceFilter() {
        let numberSelected = 0;
        if (this.qp.showFullObjectDetails) {
            numberSelected++;
        }
        if (!this.qp.doNotRetrieveRelatedObjects) {
            numberSelected++;
        }
        if (this.qp.source !== "RIPE") {
            numberSelected++;
        }
        return numberSelected > 0 ? `(${numberSelected})` : "";
    }

    // Move this to a util queryService and test it properly, i.e. with all expected message variants
    public formatError(msg: IErrorMessageModel) {
        const parts = msg.plainText.split(/%[a-z]/);
        const resultArr = [];
        if (parts.length < 2 || parts.length !== msg.args.length + 1) {
            return msg.plainText;
        }
        resultArr.push(parts[parts.length - 1]);
        for (let i = parts.length - 2; i >= 0; i--) {
            resultArr.push(msg.args[i].value);
            resultArr.push(parts[i]);
        }
        return resultArr.reverse().join("").trim().replace(/\n/g, "<br>");
    }

    private handleWhoisSearch(response: IWhoisResponseModel) {
        this.results = (this.results)
            ? this.results.concat(response.objects.object)
            : response.objects.object;
        this.whoisVersion = response.version;
        // multiple term searches can have errors, too
        this.alertsService.setAllErrors(response);
        const cleanQp = _.cloneDeep(this.qp);
        this.queryParametersService.validate(cleanQp);
        const jsonQueryString = this.queryService.buildQueryStringForLink(cleanQp);
        if (jsonQueryString) {
            this.link.perma = "query?" + this.queryService.buildPermalink(cleanQp);
            this.link.json = this.properties.REST_SEARCH_URL + "search.json?" + jsonQueryString;
            this.link.xml = this.properties.REST_SEARCH_URL + "search.xml?" + jsonQueryString;
        } else {
            this.link.perma = this.link.json = this.link.xml = "";
        }
        this.showScroller = response.objects.object.length >= this.queryService.PAGE_SIZE;
    }

    private handleWhoisSearchError(response: IWhoisResponseModel) {
        this.results = response.objects ? response.objects.object : [];
        this.alertsService.setAllErrors(response);
        this.gotoAnchor();
    }

    private clearResults() {
        this.results = [];
        this.offset = 0;
    }

    private convertListToMapOfBools(list: string[]) {
        const map = {};
        if (_.isArray(list)) {
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

    private equalsQueryParameters(formQueryParam: IQueryState, paramMap: ParamMap): boolean {
        return paramMap
            && (formQueryParam.source || null) === paramMap.getAll("source").join(",")
            && this.equalsItemsInString(formQueryParam.types, paramMap.get("types"))
            && this.equalsItemsInString(formQueryParam.inverse, paramMap.get("inverse"))
            && (formQueryParam.hierarchyFlag || null) === paramMap.get("hierarchyFlag")
            && (formQueryParam.dflag || null) === paramMap.get("dflag")
            && (formQueryParam.bflag || null) === paramMap.get("bflag")
            && (formQueryParam.rflag || null) === paramMap.get("rflag")
            && (formQueryParam.searchtext || null) === paramMap.get("searchtext");
    }

    private equalsItemsInString(formQueryParamItems: string, stateParamItems: string): boolean {
        const listFormItems = formQueryParamItems ? formQueryParamItems.split(";") : formQueryParamItems;
        const listStateItems = stateParamItems ? stateParamItems.split(";") : stateParamItems;
        return _.difference(listFormItems, listStateItems).length === 0;
    }

    private gotoAnchor() {
        if (this.alertsService.hasErrors() || this.alertsService.hasWarnings()) {
            this.setActiveAnchor("anchorTop");
        } else {
            this.setActiveAnchor("anchorForScrollToResults");
        }
    }

    private setActiveAnchor(id: string) {
        this.viewportScroller.scrollToAnchor(id);
    }
}
