import {Component, Input, OnChanges} from "@angular/core";
import {
    AssociatedObjectsService, AssociatedObjectType,
    IAssociatedObjectApiResult
} from "./associated-objects.service";
import {PropertiesService} from "../../properties.service";

@Component({
    selector: "associated-objects",
    templateUrl: "./associated-objects.component.html",
})
export class AssociatedObjectsComponent implements OnChanges {

    @Input()
    public associatedType: string;
    @Input()
    public objectType: string;
    @Input()
    public objectName: string;

    public title: string;
    public source: string = this.properties.SOURCE;
    public resultObject: IAssociatedObjectApiResult;
    public resource: any;
    public canHaveAssociatedObjects: boolean;
    public nrAssociatedObjectToShow: number = 50;

    public showScroller = true;
    public filter: string = null;
    public tableSize: number = 10;
    public tableHeight: number = 0;
    public isShowingAssociatedRouteObjects: boolean;
    private lastPage: number;
    private MAGIC = 100; // number of items per page on server
    private filterDebouncer: any = null;

    constructor(private associatedObjectService: AssociatedObjectsService,
                private properties: PropertiesService) {
    }

    public ngOnChanges() {
        this.isShowingAssociatedRouteObjects = this.associatedType === AssociatedObjectType.ASSOCIATED_ROUTE;
        this.title = this.isShowingAssociatedRouteObjects ? "Associated Route Objects" : "Associated Domain Objects";
        this.canHaveAssociatedObjects = false;
        this.lastPage = -1;
        this.getAssociatedObjectFromBackEnd();
    }

    // height is: 36 * n visible rows
    public updateHeight() {
        if (this.resultObject.associatedObjects && this.resultObject.associatedObjects.length > this.tableSize) {
            this.tableHeight = this.tableSize * 36;
        } else {
            this.tableHeight = this.resultObject.associatedObjects.length * 36;
        }
    }

    /**
     * Called by 'scroller' directive.
     */
    public almostOnScreen(): void {
        if (this.nrAssociatedObjectToShow < this.resultObject.associatedObjects.length) {
            this.nrAssociatedObjectToShow += 50;
        } else if (this.resultObject.associatedObjects.length < this.resultObject.filteredSize) {
            // resources still left on server? which ones? Use some magic!!!
            const pageNr = Math.ceil(this.resultObject.associatedObjects.length / this.MAGIC);
            this.getAssociatedObjectFromBackEnd(pageNr, this.filter);
            this.nrAssociatedObjectToShow += 50;
        }
        this.calcScroller();
    }

    public applyFilter() {
        if (this.filterDebouncer) {
            clearTimeout(this.filterDebouncer);
        }
        this.filterDebouncer = setTimeout(() => {
            this.lastPage = -1;
            this.getAssociatedObjectFromBackEnd(0, this.filter);
        }, 400);
    }

    private getAssociatedObjectFromBackEnd(pageNr = 0, associatedPrefixFilter = "") {
        if (pageNr <= this.lastPage) {
            // ignore requests for pages that we've done, or that we're are already fetching.
            return;
        }

        this.lastPage = pageNr;

        // for aut-num there is no associated domains, so no need to call service
        if ((this.objectType === "inetnum" || "inet6num" || "aut-num")
            && !(this.associatedType === "domain" && this.objectType === "aut-num")) {
            this.associatedObjectService.getAssociatedObjects(this.associatedType, this.objectName, this.objectType, pageNr, associatedPrefixFilter)
                .subscribe((response: IAssociatedObjectApiResult) => {

                    // More MAGIC! assume the next result follow the earlier ones, otherwise we need to track previous
                    // response sizes and work out how they fit with this lot.
                    if (pageNr === 0) {
                        this.resultObject = response;
                    } else {
                        this.resultObject.associatedObjects = this.resultObject.associatedObjects.concat(response.associatedObjects);
                    }

                    //do not show table if no object exists
                    if (this.resultObject.associatedObjects && this.resultObject.associatedObjects.length > 0) {
                        this.canHaveAssociatedObjects = true;
                    }
                    this.calcScroller();
                    this.updateHeight();
                }, () => {
                    this.calcScroller();
                });
        }
    }

    private calcScroller(): void {
        if (!this.resultObject) {
            return;
        }
        this.showScroller = this.nrAssociatedObjectToShow < this.resultObject.filteredSize;
        setTimeout(() => {}, 10);
    }
}
