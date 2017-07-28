class FullTextSearchController {

    public static $inject = ["$log", "FullTextSearchService", "FullTextResponseService", "WhoisMetaService"];

    public ftquery: string;
    public results: any;
    public resultSummary: ResultSummary[];

    public advancedSearch = false;
    public advmode = "all";
    public numResults: number;
    public activePage = 1;
    public objectTypes: string[];
    public selectedObjectTypes: string[] = [];
    public objectMetadata: any;
    public selectableAttributes: string[];
    public selectedAttrs: string[];
    // not used by search directly but we declare this array so that paginator instances
    // can share it (via 2-way binding) and will be sync'd.
    public navbarSyncArray: string[] = [];

    constructor(private $log: angular.ILogService,
                private searchService: FullTextSearchService,
                private fullTextResponseService: FullTextResponseService,
                private WhoisMetaService: any) {
        this.ftquery = "";
        this.objectTypes = Object.keys(WhoisMetaService._objectTypesMap);
        this.objectMetadata = this.parseMetadataToLists(WhoisMetaService._objectTypesMap);
    }

    public searchClicked() {
        if (!this.ftquery.trim()) {
            return;
        }
        this.performSearch(0);
    }

    public toggleSearchMode() {
        this.advancedSearch = !this.advancedSearch;
    }

    public pageClicked(page: number) {
        this.activePage = page;
        this.performSearch(page - 1);
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
    }

    public addObjectToFilter(type: string) {
        this.advancedSearch = true;
        for (const selected of this.selectedObjectTypes) {
            if (selected.toLowerCase() === type.toLowerCase()) {
                return;
            }
        }
        this.selectedObjectTypes.push(type.toLowerCase());
        this.performSearch(1);
    }

    private performSearch(start: number) {
        this.resultSummary = null;
        this.searchService.doSearch(
            this.ftquery.trim(),
            start,
            this.advancedSearch,
            this.advmode,
            this.selectedObjectTypes || [],
            this.selectedAttrs || []).then(
            (resp: IHttpPromiseCallbackArg<ISearchResponseModel>) => this.handleResponse(resp),
            () => { this.results = []; });
    }

    private handleResponse(resp: IHttpPromiseCallbackArg<ISearchResponseModel>) {
        this.numResults = resp.data.result.numFound;
        const responseModel = this.fullTextResponseService.parseResponse(resp.data);
        this.results = responseModel.details;
        this.resultSummary = responseModel.summary;
    }

    private parseMetadataToLists(metadata: any) {
        const result = {};
        for (const o of Object.keys(metadata)) {
            const md = metadata[o];
            result[o] = md.attributes.map((attr: IAttributeModel) => attr.name);
        }
        return result;
    }

    private refreshAttributeList(): string[] {
        const objects = this.selectedObjectTypes;
        if (!angular.isArray(objects) || objects.length === 0) {
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
        return allAttrs.sort();
    }

}

angular
    .module("dbWebApp")
    .controller("FullTextSearchController", FullTextSearchController);
