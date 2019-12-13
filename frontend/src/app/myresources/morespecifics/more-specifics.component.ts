import {Component, Input, OnChanges, OnDestroy, SimpleChanges} from "@angular/core";
import {IMoreSpecificsApiResult, MoreSpecificsService} from "./more-specifics.service";
import {Location} from "@angular/common";

@Component({
    selector: "more-specifics",
    templateUrl: "./more-specifics.component.html",
})
export class MoreSpecificsComponent implements OnChanges {

    @Input()
    public objectType: string;
    @Input()
    public objectName: string;
    @Input()
    public sponsored: boolean;

    public moreSpecifics: IMoreSpecificsApiResult;
    public canHaveMoreSpecifics: boolean;
    public showScroller = true;
    public ipFilter: string = null;
    public tableSize: number = 10;
    public tableHeight: number = 0;
    public lastPage: number;
    public MAGIC = 100; // number of items per page on server
    private filterDebouncer: any = null;

    public constructor(private moreSpecificsService: MoreSpecificsService,
                       private location: Location) {

    }

    ngOnChanges() {
        this.canHaveMoreSpecifics = false;
        this.lastPage = -1;
        this.getResourcesFromBackEnd();
    }

    // height is: 36 * n visible rows
    public updateHeight() {
        if (this.moreSpecifics.resources && this.moreSpecifics.resources.length > this.tableSize) {
            this.tableHeight = this.tableSize * 36;
        } else {
            this.tableHeight = this.moreSpecifics.resources.length * 36;
        }
    }

    /**
     * Called by 'scroller' directive.
     */
    public almostOnScreen(): void {
        if (this.moreSpecifics.resources.length < this.moreSpecifics.filteredSize) {
            // resources still left on server? which ones? Use some magic!!!
            const pageNr = Math.ceil(this.moreSpecifics.resources.length / this.MAGIC);
            this.getResourcesFromBackEnd(pageNr, this.ipFilter);
        }
        this.calcScroller();
    }

    public applyFilter() {
        if (this.filterDebouncer) {
            clearTimeout(this.filterDebouncer);
        }
        this.filterDebouncer = setTimeout(() => {
            this.lastPage = -1;
            this.getResourcesFromBackEnd(0, this.ipFilter);
        },400);
    }

    private getResourcesFromBackEnd(pageNr = 0, ipFilter = "") {
        if (pageNr <= this.lastPage) {
            // ignore requests for pages that we've done, or that we're are already fetching.
            return;
        }
        if (this.location.path().indexOf("/myresources/detail") < 0) {
            this.lastPage = -1;
            this.showScroller = false;
            return;
        }
        this.lastPage = pageNr;
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            this.moreSpecificsService.getSpecifics(this.objectName, this.objectType, pageNr, ipFilter)
                .subscribe((response: IMoreSpecificsApiResult) => {

                    // More MAGIC! assume the next result follow the earlier ones, otherwise we need to track previous
                    // response sizes and work out how they fit with this lot.
                    if (pageNr === 0) {
                        this.moreSpecifics = response;
                    } else {
                        this.moreSpecifics.resources = this.moreSpecifics.resources.concat(response.resources);
                    }
                    this.canHaveMoreSpecifics = true;
                    this.calcScroller();
                    this.updateHeight();
                }, () => {
                    this.calcScroller();
                });
        }
    }

    private calcScroller(): void {
        if (!this.moreSpecifics) {
            return;
        }
        this.showScroller = true;
        setTimeout(() => {}, 10);
    }
}
