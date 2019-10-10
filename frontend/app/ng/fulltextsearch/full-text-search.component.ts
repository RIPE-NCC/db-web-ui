import {FullTextSearchService} from "./full-text-search.service";
import {DomSanitizer} from "@angular/platform-browser";
import {Component, SecurityContext} from "@angular/core";
import {WhoisMetaService} from "../shared/whois-meta.service";
import {FullTextResponseService} from "./full-text-response.service";
import {IAttributeModel} from "../shared/whois-response-type.model";
import {IResultSummary, ISearchResponseModel} from "./types.model";
import {PropertiesService} from "../properties.service";

@Component({
    selector: "full-text-search",
    templateUrl: "./full-text-search.component.html",
})
export class FullTextSearchComponent {

    // In
    public ftquery: string;
    public advmode = "all";
    public advancedSearch = false;
    public selectedObjectTypes: string[] = [];
    public selectedAttrs: string[] = [];
    public resultSummary: IResultSummary[] = [];
    public numResults: number;

    // Out
    public objectTypes: string[];
    public objectMetadata: any;
    public selectableAttributes: string[] = [];
    public results: any;
    public showError = "";
    public activePage = 1;
    public numResultsPerPage: number;

    // not used by search directly but we declare this array so that paginator instances
    // can share it (via 2-way binding) and will be sync'd.
    public navbarSyncArray: number[] = [];

    private lastHash = "";

    // attributes which are skipped in fulltext search on whois side
    private readonly attrsNotConsiderableByWhois: string[] = ["source", "certif", "changed"];

    constructor(private searchService: FullTextSearchService,
                private fullTextResponseService: FullTextResponseService,
                private whoisMetaService: WhoisMetaService,
                public properties: PropertiesService,
                private sanitizer: DomSanitizer) {}

    public ngOnInit() {
        this.ftquery = "";
        this.objectTypes = Object.keys(this.whoisMetaService.objectTypesMap);
        this.objectMetadata = this.parseMetadataToLists(this.whoisMetaService.objectTypesMap);
        this.numResultsPerPage = 10;
    }

    public searchClicked() {
        if (!this.ftquery.trim()) {
            this.showError = "fullText.emptyQueryText.text";
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
        this.selectedObjectTypes.push(this.objectTypes.find(t => t === type.toLowerCase()));
        this.objectTypeChanged();
        this.performSearch(0);
    }

    private performSearch(start: number) {
        this.showError = "";
        if (!this.advancedSearch) {
            this.selectNone();
        }
        this.searchService.doSearch(
            this.ftquery.trim(),
            start,
            this.advancedSearch,
            this.advmode,
            this.selectedObjectTypes || [],
            this.selectedAttrs || [])
            .subscribe((resp: ISearchResponseModel) => this.handleResponse(resp),
                (err) => {
                this.results = [];
                console.error("performSearch error", err);
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
        if (this.results.length === 0) {
            this.showError = "fullText.emptyRresult.text";
        }
    }

    private parseMetadataToLists(metadata: any): { [key: string]: string } {
        const result = {};
        for (const o of Object.keys(metadata)) {
            const md = metadata[o];
            result[o] = md.attributes.map((attr: IAttributeModel) => attr.name);
        }
        return result;
    }

    private refreshAttributeList(): string[] {
        const objects = this.selectedObjectTypes;
        if (!_.isArray(objects) || objects.length === 0) {
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
        const allAttrsConsiderableByWhois = allAttrs.filter((item)  => this.attrsNotConsiderableByWhois.indexOf(item) < 0);
        return allAttrsConsiderableByWhois.sort();
    }

    public queryHash(): string {
        return [
            this.ftquery,
            this.advmode,
            this.advancedSearch,
            this.selectedObjectTypes.map((t) => t).join(""),
            this.selectedAttrs.map((t) => t).join(""),
        ].join("");
    }
}
