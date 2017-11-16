class PaginationController {

    public static $inject = [
        "$scope",
    ];

    public numResults: number;
    public resultsPerPage: number;
    public pageClicked: (page: any) => void;
    public activePage: number;
    public hidePaginator: boolean;

    public rewindDisabled = false;
    public ffDisabled = false;
    public pages: number[];

    public maxNumPaginatorTabs = 10;

    constructor(private $scope: any) {
        this.activePage = 1;
    }

    public $onInit() {
        this.$scope.$watch(() => this.numResults, () => {
            this.refresh();
        });
    }

    public pageSelected(page: number) {
        const numPages = Math.ceil(this.numResults / this.resultsPerPage);
        if (page < 1) {
            page = 1;
        } else if (page > numPages) {
            page = numPages;
        }
        if (this.activePage === page) {
            // we're already on that page
            return;
        }
        this.pageClicked({page});
        this.activePage = page;
        this.refresh();
    }

    public fastFwd(num: number) {
        this.pageSelected(num + this.activePage);
    }

    private refresh() {
        this.hidePaginator = this.numResults <= this.resultsPerPage;
        if (this.hidePaginator) {
            return;
        }
        const numPages = Math.ceil(this.numResults / this.resultsPerPage);
        let firstPage = 1;
        if (numPages > this.maxNumPaginatorTabs) {
            firstPage = Math.ceil(Math.min(numPages - this.maxNumPaginatorTabs,
                Math.max(1, this.activePage - this.maxNumPaginatorTabs / 2)));
        }
        this.rewindDisabled = this.activePage === 1;
        this.ffDisabled = this.activePage === numPages;
        this.pages = [];
        for (let i = firstPage; i <= Math.min(firstPage + this.maxNumPaginatorTabs, numPages); i++) {
            this.pages.push(i);
        }
    }
}

angular.module("dbWebApp").component("paginator", {
    bindings: {
        activePage: "=",
        numResults: "<",
        pageClicked: "&",
        pages: "=",
        resultsPerPage: "<",
    },
    controller: PaginationController,
    templateUrl: "scripts/paginator/paginator.html",
});
