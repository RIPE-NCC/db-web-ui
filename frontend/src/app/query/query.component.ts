import { ViewportScroller } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as _ from 'lodash';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { IObjectMessageModel, IVersion, IWhoisObjectModel, IWhoisResponseModel } from '../shared/whois-response-type.model';
import { HierarchyFlagsService } from './hierarchy-flags.service';
import { ObjectTypesEnum } from './object-types.enum';
import { IQueryParameters, ITemplateTerm, QueryParametersService } from './query-parameters.service';
import { QueryService } from './query.service';

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

export type ShareLink = {
    json: string;
    perma: string;
    xml: string;
    plainText: string;
};

@Component({
    selector: 'query',
    templateUrl: './query.component.html',
})
export class QueryComponent implements OnDestroy {
    public offset = 0;
    public showScroller = false;
    // filter panel - dropdowns Types, Hierarchy, Inverse Lookup and Advance Filters
    public showFilters = false;
    public numberSelectedTypes = 0;
    public numberSelectedHierarchyItems = 0;
    public numberSelectedInverseLookups = 0;
    public numberSelectedAdvanceFilterItems = 0;
    public searched = false;
    public titleDatabaseQueryPage: string;
    public headDatabaseQueryPage: string;

    public results: IWhoisObjectModel[];
    public showNoResultsMsg = false;
    public whoisVersion: IVersion;
    public active = 1;

    public qp: IQueryParameters;
    public showTemplatePanel: boolean;
    public queriedTemplateObject: ITemplateTerm;
    public subscription: any;
    public link: ShareLink;
    public showsQueryFlagsContainer: boolean;
    public showsDocsLink: boolean;
    public colorControl = new FormControl('primary');
    // Types in dropdown
    public availableTypes: string[] = [];
    // Search recognizing email and nserver, and filter inverse lookup according to typeOfSearchedTerm
    public typeOfSearchedTerm: string[] = [];

    constructor(
        public properties: PropertiesService,
        public queryService: QueryService,
        private queryParametersService: QueryParametersService,
        public alertsService: AlertsService,
        private viewportScroller: ViewportScroller,
        public activatedRoute: ActivatedRoute,
        public router: Router,
    ) {
        this.showsDocsLink = true;
        this.qp = {
            queryText: '',
            types: {},
            inverse: {},
            hierarchy: '',
            reverseDomain: false,
            doNotRetrieveRelatedObjects: false,
            showFullObjectDetails: false,
            source: '',
        };
        this.subscription = this.activatedRoute.queryParams.subscribe(() => {
            if (this.alertsService) {
                this.alertsService.clearAlertMessages();
            }
            this.init();
        });
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    public init() {
        this.setPageTitle();
        const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
        this.qp.source = queryParamMap.has('source') ? queryParamMap.getAll('source').join(',') : this.properties.SOURCE;
        this.link = {
            json: '',
            perma: '',
            xml: '',
            plainText: '',
        };

        this.qp.types = queryParamMap.get('types') ? this.convertListToMapOfBools(queryParamMap.get('types').split(';')) : {};
        this.qp.inverse = queryParamMap.get('inverse') ? this.convertListToMapOfBools(queryParamMap.get('inverse').split(';')) : {};
        this.qp.hierarchy = HierarchyFlagsService.longHierarchyFlagToShort(queryParamMap.get('hierarchyFlag'));
        this.qp.reverseDomain = this.flagToBoolean(queryParamMap.get('dflag'), false); // -d
        this.qp.showFullObjectDetails = this.flagToBoolean(queryParamMap.get('bflag'), false); // -B
        this.qp.doNotRetrieveRelatedObjects = this.flagToBoolean(queryParamMap.get('rflag'), true); // -r
        this.qp.queryText = (queryParamMap.has('searchtext') ? queryParamMap.get('searchtext') : '').trim();
        // on page refresh or in case of bookmarked page
        if (this.qp.queryText) {
            this.clearResults();
            this.doSearch();
        }
        // in case click on lefthand menu, no queryText then refresh result array or hide template panel
        if (this.qp.queryText === '') {
            this.clearResults();
            this.showTemplatePanel = false;
            this.showFilters = false; // by default don't open share button with perma, xml and json links
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
            void this.router.navigate(['query'], { queryParams: formQueryParam });
        }
    }

    public uncheckAllCheckboxes() {
        this.qp.types = {};
        this.qp.inverse = {};
        this.resetHierarchyDropdown();
        this.resetAdvanceFilter();
    }

    public resetFilters() {
        this.uncheckAllCheckboxes();
        this.submitSearchForm();
    }

    private resetHierarchyDropdown() {
        this.qp.hierarchy = undefined;
        this.qp.reverseDomain = false;
        this.numberSelectedHierarchyItems = 0;
        // since we don't use [(ngModel)] on HierarchyFlagsPanelComponent, we need to manually trigger the render of the component
        this.qp = { ...this.qp };
    }

    private resetAdvanceFilter() {
        this.qp.showFullObjectDetails = false;
        this.qp.doNotRetrieveRelatedObjects = true;
        this.qp.source = this.properties.SOURCE;
    }

    public uncheckReverseDomain() {
        this.qp.reverseDomain = false;
    }

    public doSearch() {
        this.searched = true;
        if (!this.qp.queryText) {
            this.clearResults();
            return;
        }
        this.showsDocsLink = false;
        const cleanQp = _.cloneDeep(this.qp);
        // Reset on-screen widgets
        this.alertsService.clearAlertMessages();

        // by default in flag search related objects are shown, in search with filters related objects are not shown
        if (this.showsQueryFlagsContainer) {
            cleanQp.doNotRetrieveRelatedObjects = false;
        }
        const issues = this.queryParametersService.validate(cleanQp);
        for (const msg of issues.warnings) {
            const war: IObjectMessageModel = {
                severity: 'warning',
                plainText: msg,
            };
            this.alertsService.addGlobalWarning(this.formatError(war));
        }
        for (const msg of issues.errors) {
            const err: IObjectMessageModel = {
                severity: 'error',
                plainText: msg,
            };
            this.alertsService.addGlobalError(this.formatError(err));
        }
        if (issues.errors.length) {
            this.showNoResultsMsg = true;
            this.gotoAnchor();
            return;
        }

        if (QueryParametersService.isQueriedTemplate(cleanQp.queryText)) {
            this.showTemplatePanel = issues.errors.length === 0;
            this.queriedTemplateObject = cleanQp.queriedTemplateObject;
            setTimeout(() => this.gotoAnchor(), 0);
        } else {
            this.showTemplatePanel = false;
            this.queryService.searchWhoisObjects(cleanQp, this.offset).subscribe({
                next: (response: IWhoisResponseModel) => {
                    this.handleWhoisSearch(response);
                    if (this.offset === 0) {
                        setTimeout(() => this.gotoAnchor(), 0);
                    }
                },
                error: (error: IWhoisResponseModel) => this.handleWhoisSearchError(error),
            });
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

    public isFiltersDisplayed(): boolean {
        return !this.showsQueryFlagsContainer && this.showFilters;
    }

    private countSelectedDropdownItems(list): number {
        return Object.keys(list).filter((element) => list[element] === true).length;
    }

    private countSelectedDropdownHierarchyFlags(): number {
        let count = 0;
        if (this.qp.reverseDomain) {
            count++;
        }
        if (!!this.qp.hierarchy && this.qp.hierarchy !== HierarchyFlagsService.hierarchyFlagMap[0].short) {
            count++;
        }
        return count;
    }

    private countSelectedDropdownAdvanceFilter(): number {
        let numberSelected = 0;
        if (this.qp.showFullObjectDetails) {
            numberSelected++;
        }
        if (!this.qp.doNotRetrieveRelatedObjects) {
            numberSelected++;
        }
        if (this.qp.source !== 'RIPE') {
            numberSelected++;
        }
        return numberSelected;
    }

    public printNumberSelected(numberSelectedItems: number) {
        return numberSelectedItems > 0 ? `(${numberSelectedItems})` : '';
    }

    public isFilteringResults() {
        this.numberSelectedTypes = this.countSelectedDropdownItems(this.qp.types);
        this.numberSelectedHierarchyItems = this.countSelectedDropdownHierarchyFlags();
        this.numberSelectedInverseLookups = this.countSelectedDropdownItems(this.qp.inverse);
        this.numberSelectedAdvanceFilterItems = this.countSelectedDropdownAdvanceFilter();
        return this.numberSelectedTypes + this.numberSelectedHierarchyItems + this.numberSelectedInverseLookups + this.numberSelectedAdvanceFilterItems > 0;
    }

    // Move this to util queryService and test it properly, i.e. with all expected message variants
    public formatError(msg: IObjectMessageModel) {
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
        return resultArr.reverse().join('').trim().replace(/\n/g, '<br>');
    }

    public filterCheckboxes() {
        // disable checkboxes according to type of query term
        this.availableTypes = this.queryService.getTypesAppropriateToQuery(this.qp.queryText);
        this.typeOfSearchedTerm = this.queryService.getTypeOfSearchedTerm(this.qp.queryText);
        this.uncheckAllCheckboxes();
    }

    public isDisabledHierarchyDropdown() {
        const enableHierarchyForTypes: string[] = [
            ObjectTypesEnum.INETNUM.valueOf(),
            ObjectTypesEnum.INET6NUM.valueOf(),
            ObjectTypesEnum.DOMAIN.valueOf(),
            ObjectTypesEnum.ROUTE.valueOf(),
            ObjectTypesEnum.ROUTE6.valueOf(),
        ];
        const isDisabled = !this.availableTypes.some((type) => enableHierarchyForTypes.includes(type));
        // remove number of filter
        if (isDisabled) {
            this.resetHierarchyDropdown();
        }
        return isDisabled;
    }

    private handleWhoisSearch(response: IWhoisResponseModel) {
        this.results = this.results ? this.results.concat(response.objects.object) : response.objects.object;
        this.isNoResultsMsgShown();
        this.whoisVersion = response.version;
        // multiple term searches can have errors, too
        this.alertsService.setAllErrors(response);
        const cleanQp = _.cloneDeep(this.qp);
        this.queryParametersService.validate(cleanQp);
        const jsonQueryString = this.queryService.buildQueryStringForLink(cleanQp);
        if (jsonQueryString) {
            this.link.perma = window.location.origin + '/db-web-ui/query?' + this.queryService.buildPermalink(cleanQp);
            this.link.json = this.properties.REST_SEARCH_URL + 'search.json?' + jsonQueryString;
            this.link.xml = `${this.properties.REST_SEARCH_URL}search.xml?${jsonQueryString}`;
            this.link.plainText = `${this.properties.REST_SEARCH_URL}search.txt?${jsonQueryString}`;
        } else {
            this.link.perma = this.link.json = this.link.xml = this.link.plainText = '';
        }
        this.showScroller = response.objects.object.length >= this.queryService.PAGE_SIZE;
        this.showFilters = true;
        this.availableTypes = this.queryService.getTypesAppropriateToQuery(this.qp.queryText);
        this.typeOfSearchedTerm = this.queryService.getTypeOfSearchedTerm(this.qp.queryText);
    }

    private handleWhoisSearchError(response: IWhoisResponseModel) {
        this.results = response.objects ? response.objects.object : [];
        this.isNoResultsMsgShown();
        this.alertsService.setAllErrors(response);
        this.gotoAnchor();
    }

    private isNoResultsMsgShown() {
        this.showNoResultsMsg = this.results.length === 0;
    }

    private clearResults() {
        this.results = [];
        this.showNoResultsMsg = false;
        this.showsDocsLink = true;
        this.offset = 0;
    }

    private convertListToMapOfBools(list: string[]) {
        const map = {};
        if (_.isArray(list)) {
            for (const l of list) {
                map[l.replace(/-/g, '_').toLocaleUpperCase()] = true;
            }
        }
        return map;
    }

    private flagToBoolean(flag: string, def: boolean): boolean {
        if (typeof flag !== 'string') {
            return def;
        }
        return flag.toLowerCase() === 'true';
    }

    private equalsQueryParameters(formQueryParam: IQueryState, paramMap: ParamMap): boolean {
        return (
            paramMap &&
            (formQueryParam.source || null) === paramMap.getAll('source').join(',') &&
            this.equalsItemsInString(formQueryParam.types, paramMap.get('types')) &&
            this.equalsItemsInString(formQueryParam.inverse, paramMap.get('inverse')) &&
            (formQueryParam.hierarchyFlag || null) === paramMap.get('hierarchyFlag') &&
            (formQueryParam.dflag || null) === paramMap.get('dflag') &&
            (formQueryParam.bflag || null) === paramMap.get('bflag') &&
            (formQueryParam.rflag || null) === paramMap.get('rflag') &&
            (formQueryParam.searchtext || null) === paramMap.get('searchtext')
        );
    }

    private equalsItemsInString(formQueryParamItems: string, stateParamItems: string): boolean {
        const listFormItems = formQueryParamItems ? formQueryParamItems.split(';') : formQueryParamItems;
        const listStateItems = stateParamItems ? stateParamItems.split(';') : stateParamItems;
        return _.difference(listFormItems, listStateItems).length === 0;
    }

    private gotoAnchor() {
        if (this.alertsService.hasErrors() || this.alertsService.hasWarnings()) {
            this.setActiveAnchor('anchorTop');
        } else {
            this.setActiveAnchor('anchorForScrollToResults');
        }
    }

    private setActiveAnchor(id: string) {
        this.viewportScroller.scrollToAnchor(id);
    }

    private setPageTitle() {
        if (this.properties.isProdEnv()) {
            this.headingDatabaseQueryPage = 'Querying the RIPE Database';
            this.titleDatabaseQueryPage = 'RIPE Database Query';
        } else if (this.properties.isTrainingEnv()) {
            this.headingDatabaseQueryPage = 'Querying the TEST Database';
            this.titleDatabaseQueryPage = 'Training Database Query';
        } else {
            this.headingDatabaseQueryPage = `Querying the ${this.properties.ENV.toUpperCase()} Database`;
            this.titleDatabaseQueryPage = `${this.properties.ENV.toUpperCase()} Database Query`;
        }
    }
}
