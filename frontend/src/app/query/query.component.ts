import {Component, OnDestroy, ViewChild} from "@angular/core";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import * as _ from "lodash";
import {IErrorMessageModel, IVersion, IWhoisObjectModel, IWhoisResponseModel} from "../shared/whois-response-type.model";
import {IQueryParameters, ITemplateTerm, QueryParametersService} from "./query-parameters.service";
import {QueryService} from "./query.service";
import {PropertiesService} from "../properties.service";
import {AlertsComponent} from "../shared/alert/alerts.component";

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

    public qp: IQueryParameters;
    public showTemplatePanel: boolean;
    public queriedTemplateObject: ITemplateTerm;
    public subscription: any;
    public link: {
        json: string;
        perma: string;
        xml: string;
    };

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(public properties: PropertiesService,
                private queryService: QueryService,
                private queryParametersService: QueryParametersService,
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
            if (this.alertsComponent) {
                this.alertsComponent.clearErrors();
            }
            this.init();
        }));
    }

    public ngOnDestroy() {
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
        this.qp.hierarchy = QueryParametersService.longHierarchyFlagToShort(queryParamMap.get("hierarchyFlag"));
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
        this.alertsComponent.clearErrors();

        const issues = this.queryParametersService.validate(cleanQp);
        for (const msg of issues.warnings) {
            const war: IErrorMessageModel = {
                severity: "warning",
                plainText: msg,
            };
            this.alertsComponent.addGlobalWarning(this.formatError(war));
        }
        for (const msg of issues.errors) {
            const err: IErrorMessageModel = {
                severity: "error",
                plainText: msg,
            };
            this.alertsComponent.addGlobalError(this.formatError(err));
        }
        if (issues.errors.length) {
            this.gotoAnchor();
            return;
        }

        if (QueryParametersService.isQueriedTemplate(cleanQp.queryText)) {
            this.showTemplatePanel = issues.errors.length === 0;
            this.queriedTemplateObject = cleanQp.queriedTemplateObject;
        } else {
            this.showTemplatePanel = false;
            this.queryService
                .searchWhoisObjects(cleanQp, this.offset)
                .subscribe((response: IWhoisResponseModel) => {
                        this.handleWhoisSearch(response);
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

    public whoisCliQuery(): string {
        if (!this.qp.queryText || this.qp.queryText.indexOf(";") > -1) {
            return " ";
        }
        const qpClean = _.cloneDeep(this.qp);
        if (this.queryParametersService.validate(qpClean).errors.length > 0) {
            return " ";
        }
        if (QueryParametersService.isQueriedTemplate(qpClean.queryText)) {
            return qpClean.queryText;
        }
        const q = [];
        const invs = QueryParametersService.inverseAsList(qpClean).join(",");
        const typs = QueryParametersService.typesAsList(qpClean).join(",");
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
        } else {
            q.filter((term: string) => !term.endsWith("--resource"));
        }
        const containMoreSources = qpClean.source.includes(",");
        const notRipeSource = !qpClean.source.includes("RIPE") || !qpClean.source.includes("RIPE-NONAUTH");
        if (qpClean.source !== "GRS" && (containMoreSources || notRipeSource)){
            q.push(` --sources ${qpClean.source}`);
        }
        q.push(" " + qpClean.queryText);
        return q.join("").trim();
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
        this.alertsComponent.setAllErrors(response);
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
        if (this.offset === 0) {
            this.gotoAnchor();
        }
        this.showScroller = response.objects.object.length >= this.queryService.PAGE_SIZE;
    }

    private handleWhoisSearchError(response: IWhoisResponseModel) {
        this.results = response.objects ? response.objects.object : [];
        this.alertsComponent.setAllErrors(response);
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
        if (this.alertsComponent.hasErrors() || this.alertsComponent.hasWarnings()) {
            QueryComponent.setActiveAnchor("anchorTop");
        } else {
            QueryComponent.setActiveAnchor("resultsSection");
        }
    }

    private static setActiveAnchor(id: string) {
        document.querySelector(`#${id}`).scrollIntoView();
    }
}
