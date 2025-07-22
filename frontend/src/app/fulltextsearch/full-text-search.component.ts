import { Component, OnDestroy, OnInit } from '@angular/core';
import { isArray } from 'lodash';
import { Labels } from '../label.constants';
import { PropertiesService } from '../properties.service';
import { AlertsService } from '../shared/alert/alerts.service';
import { WhoisMetaService } from '../shared/whois-meta.service';
import { IAttributeModel, IVersion } from '../shared/whois-response-type.model';
import { FullTextResponseService } from './full-text-response.service';
import { FullTextSearchService } from './full-text-search.service';
import { IResultSummary, ISearchResponseModel } from './types.model';

@Component({
    selector: 'full-text-search',
    templateUrl: './full-text-search.component.html',
    styleUrl: 'full-text-search.component.scss',
    standalone: false,
})
export class FullTextSearchComponent implements OnInit, OnDestroy {
    // In
    public ftquery: string;
    public advmode = 'all';
    public advancedSearch = false;
    public selectedObjectTypes: string[] = [];
    public selectedAttrs: string[] = [];
    public resultSummary: IResultSummary[] = [];
    public numResults: number;
    public whoisVersion: IVersion;

    // Out
    public objectTypes: string[];
    public objectMetadata: any;
    public selectableAttributes: string[] = [];
    public results: any;
    public activePage = 1;
    public numResultsPerPage: number;

    // not used by search directly but we declare this array so that paginator instances
    // can share it (via 2-way binding) and will be sync'd.
    public navbarSyncArray: number[] = [];

    public titleEnvironment: string;

    private lastHash = '';

    // attributes which are skipped in fulltext search on whois side
    private readonly attrsNotConsiderableByWhois: string[] = ['source', 'certif', 'changed'];

    constructor(
        private searchService: FullTextSearchService,
        private fullTextResponseService: FullTextResponseService,
        private whoisMetaService: WhoisMetaService,
        public properties: PropertiesService,
        public alertsService: AlertsService,
    ) {}

    public ngOnInit() {
        this.ftquery = '';
        this.objectTypes = Object.keys(this.whoisMetaService.objectTypesMap);
        this.objectMetadata = FullTextSearchComponent.parseMetadataToLists(this.whoisMetaService.objectTypesMap);
        this.numResultsPerPage = 10;
        this.titleEnvironment = this.properties.getTitleEnvironment();
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
    }

    public searchClicked() {
        if (!this.ftquery.trim()) {
            this.alertsService.setGlobalWarning(Labels['fullText.emptyQueryText.text']);
            return;
        }
        this.performSearch(0);
    }

    public toggleSearchMode() {
        this.advancedSearch = !this.advancedSearch;
    }

    public pageClicked(page: number) {
        this.activePage = page;
        this.performSearch((page - 1) * this.numResultsPerPage);
    }

    public objectTypeChanged() {
        this.selectableAttributes = this.refreshAttributeList();
    }

    public selectAll() {
        this.selectedObjectTypes = this.objectTypes;
        this.objectTypeChanged();
    }

    public selectNone() {
        this.selectedObjectTypes = this.selectableAttributes = [];
        this.selectedAttrs = [];
        this.objectTypeChanged();
    }

    public addObjectToFilter(type: string) {
        this.advancedSearch = true;
        for (const selected of this.selectedObjectTypes) {
            if (selected.toLowerCase() === type.toLowerCase()) {
                return;
            }
        }
        this.selectedObjectTypes = [];
        this.selectedObjectTypes.push(this.objectTypes.find((t) => t === type.toLowerCase()));
        this.objectTypeChanged();
        this.performSearch(0);
    }

    public getResultText(result: any): string {
        let text = '';
        result.hls.forEach((hls, index) => {
            if (index > 0) text += ', ';
            text = `${text}${hls.name}=${hls.value}`;
        });
        return text;
    }

    private performSearch(start: number) {
        this.alertsService.clearAlertMessages();
        if (!this.advancedSearch) {
            this.selectNone();
        }
        this.searchService
            .doSearch(this.ftquery.trim(), start, this.advancedSearch, this.advmode, this.selectedObjectTypes || [], this.selectedAttrs || [])
            .subscribe({
                next: (resp: ISearchResponseModel) => this.handleResponse(resp),
                error: (err) => {
                    this.alertsService.setGlobalError('Error performing search query. Please review the terms and try again');
                    this.numResults = 0;
                    this.results = [];
                    this.resultSummary = [];
                    console.error('performSearch error', err);
                },
            });
    }

    private handleResponse(resp: ISearchResponseModel) {
        const responseModel = this.fullTextResponseService.parseResponse(resp);
        const qh = this.queryHash();
        if (this.lastHash !== qh) {
            this.activePage = 1;
            this.lastHash = qh;
        }
        this.numResults = resp.result.numFound;
        this.results = responseModel.details;
        this.resultSummary = responseModel.summary;
        this.whoisVersion = this.fullTextResponseService.getVersionFromResponse(resp);
        if (this.results.length === 0) {
            this.alertsService.setGlobalWarning(Labels['fullText.emptyResult.text']);
        }
    }

    private static parseMetadataToLists(metadata: any): { [key: string]: string } {
        const result = {};
        for (const o of Object.keys(metadata)) {
            const md = metadata[o];
            result[o] = md.attributes.map((attr: IAttributeModel) => attr.name);
        }
        return result;
    }

    private refreshAttributeList(): string[] {
        const objects = this.selectedObjectTypes;
        if (!isArray(objects) || objects.length === 0) {
            return [];
        }
        const allAttrs: string[] = [];
        for (const otype of objects) {
            const attrs = this.objectMetadata[otype];
            for (const attr of attrs) {
                if (allAttrs.indexOf(attr) === -1) {
                    allAttrs.push(attr);
                }
            }
        }
        const allAttrsConsiderableByWhois = allAttrs.filter((item) => this.attrsNotConsiderableByWhois.indexOf(item) < 0);
        return allAttrsConsiderableByWhois.sort();
    }

    public queryHash(): string {
        return [
            this.ftquery,
            this.advmode,
            this.advancedSearch,
            this.selectedObjectTypes.map((t) => t).join(''),
            this.selectedAttrs.map((t) => t).join(''),
        ].join('');
    }
}
