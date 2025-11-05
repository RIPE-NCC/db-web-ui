import { NgClass, NgFor, NgIf, ViewportScroller } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as _ from 'lodash';
import { BannerComponent, BannerTypes } from '../banner/banner.component';
import { TypeformBannerComponent } from '../banner/typeform-banner/typeform-banner.component';
import { OrgDropDownComponent } from '../dropdown/org-drop-down.component';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { LabelPipe } from '../shared/label.pipe';
import { LoadingIndicatorComponent } from '../shared/loadingindicator/loading-indicator.component';
import { ScrollerDirective } from '../shared/scroller.directive';
import { SearchFieldComponent } from '../shared/sreachfield/search-field.component';
import { SubmittingAgreementComponent } from '../shared/submitting-agreement.component';
import { IObjectMessageModel, IVersion, IWhoisObjectModel, IWhoisResponseModel } from '../shared/whois-response-type.model';
import { WebAppVersionComponent } from '../version/web-app-version.component';
import { WhoisVersionComponent } from '../version/whois-version.component';
import { AdvanceFilterPanelComponent } from './advance-filter-panel.component';
import { CertificateInfoComponent } from './certificate-info.component';
import { HierarchyFlagsPanelComponent } from './hierarchy-flags-panel.component';
import { HierarchyFlagsService } from './hierarchy-flags.service';
import { InverseLookupPanelComponent } from './inverse-lookup-panel.component';
import { LookupComponent } from './lookup.component';
import { ObjectTypesEnum } from './object-types.enum';
import { QueryFlagsComponent } from './query-flags.component';
import { QueryFlagsService } from './query-flags.service';
import { IQueryParameters, ITemplateTerm, QueryParametersService } from './query-parameters.service';
import { QueryService } from './query.service';
import { SharePanelComponent } from './share-panel.component';
import { TemplateComponent } from './templatecomponent/template.component';
import { TypesPanelComponent } from './types-panel.component';

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
    standalone: true,
    imports: [
        BannerComponent,
        OrgDropDownComponent,
        FormsModule,
        NgClass,
        SearchFieldComponent,
        QueryFlagsComponent,
        NgIf,
        MatButton,
        MatMenuTrigger,
        MatMenu,
        TypesPanelComponent,
        HierarchyFlagsPanelComponent,
        InverseLookupPanelComponent,
        AdvanceFilterPanelComponent,
        SubmittingAgreementComponent,
        MatIconButton,
        MatSuffix,
        MatTooltip,
        MatIcon,
        SharePanelComponent,
        NgFor,
        LookupComponent,
        ScrollerDirective,
        LoadingIndicatorComponent,
        TemplateComponent,
        CertificateInfoComponent,
        TypeformBannerComponent,
        WhoisVersionComponent,
        WebAppVersionComponent,
        LabelPipe,
    ],
})
export class QueryComponent implements OnDestroy {
    properties = inject(PropertiesService);
    queryService = inject(QueryService);
    queryFlagService = inject(QueryFlagsService);
    private queryParametersService = inject(QueryParametersService);
    alertsService = inject(AlertsService);
    private viewportScroller = inject(ViewportScroller);
    activatedRoute = inject(ActivatedRoute);
    router = inject(Router);

    public offset = 0;
    public showScroller = false;
    // filter panel - dropdowns Types, Hierarchy, Inverse Lookup and Advance Filters
    public showFilters = false;
    public numberSelectedTypes = 0;
    public numberSelectedHierarchyItems = 0;
    public numberSelectedInverseLookups = 0;
    public numberSelectedAdvanceFilterItems = 0;
    public searched = false;
    public titleEnvironment: string;
    public headEnvironment: string;

    public results: IWhoisObjectModel[];
    public showNoResultsMsg = false;
    public whoisVersion: IVersion;
    public active = 1;

    public qp: IQueryParameters;
    public showTemplatePanel: boolean;
    public queriedTemplateObject: ITemplateTerm;
    public subscription: any;
    public link: ShareLink;
    public showsDocsLink: boolean;
    public colorControl = new FormControl('primary');
    // Types in dropdown
    public availableTypes: string[] = [];
    // Search recognizing email and nserver, and filter inverse lookup according to typeOfSearchedTerm
    public typeOfSearchedTerm: string[] = [];

    constructor() {
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
        this.titleEnvironment = this.properties.getTitleEnvironment();
        this.headEnvironment = this.getHeaderEnvironment();
        this.uncheckAllCheckboxes();
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
        this.numberSelectedTypes = 0;
        this.numberSelectedHierarchyItems = 0;
        this.numberSelectedInverseLookups = 0;
        this.numberSelectedAdvanceFilterItems = 0;
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
        if (this.isShownQueryFlagsContainer()) {
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

    private isShownQueryFlagsContainer(): boolean {
        const queryFlags = this.queryFlagService.getFlagsFromTerm(this.qp.queryText);
        return queryFlags.length > 0;
    }

    public isFiltersDisplayed(): boolean {
        return !this.isShownQueryFlagsContainer() && this.showFilters;
    }

    public printNumberSelected(numberSelectedItems: number) {
        return numberSelectedItems > 0 ? `(${numberSelectedItems})` : '';
    }

    public isFilteringResults() {
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

    private getHeaderEnvironment() {
        if (this.properties.isProdEnv()) {
            return 'RIPE';
        } else if (this.properties.isTrainingEnv()) {
            return 'TEST';
        } else {
            return `${this.properties.ENV.toUpperCase()}`;
        }
    }

    protected readonly BannerTypes = BannerTypes;
}
