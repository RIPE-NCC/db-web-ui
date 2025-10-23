import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'paginator',
    templateUrl: './paginator.component.html',
    imports: [NgFor, NgClass],
})
export class PaginationComponent implements OnInit, OnChanges {
    @Input()
    public numResults: number;
    @Input()
    public resultsPerPage: number;
    @Input()
    public activePage: number;
    @Input()
    public pages: number[];
    @Output()
    public pageClicked: EventEmitter<number> = new EventEmitter<number>();

    public hidePaginator: boolean;
    public rewindDisabled = false;
    public ffDisabled = false;
    public maxNumPaginatorTabs = 10;

    constructor() {
        this.activePage = 1;
    }

    public ngOnInit() {
        this.refresh();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes['numResults']) {
            this.refresh();
        }
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
        this.pageClicked.emit(page);
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
            firstPage = Math.ceil(Math.min(numPages - this.maxNumPaginatorTabs, Math.max(1, this.activePage - this.maxNumPaginatorTabs / 2)));
        }
        this.rewindDisabled = this.activePage === 1;
        this.ffDisabled = this.activePage === numPages;
        this.pages = [];
        for (let i = firstPage; i <= Math.min(firstPage + this.maxNumPaginatorTabs, numPages); i++) {
            this.pages.push(i);
        }
    }
}
