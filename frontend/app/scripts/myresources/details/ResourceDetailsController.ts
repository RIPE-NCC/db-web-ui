interface IResourceDetailsControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class ResourceDetailsController {

    public static $inject = [
        "$scope",
        "$log",
        "$state",
        "$timeout",
        "$anchorScroll",
        "QueryParametersService",
        "MoreSpecificsService",
    ];

    public whoisResponse: IWhoisResponseModel;
    public details: IWhoisObjectModel;
    public moreSpecifics: IMoreSpecificsApiResult;
    public resource: any;
    public flags: string[] = [];
    public canHaveMoreSpecifics: boolean;
    public nrMoreSpecificsToShow: number = 50;
    public show: {
        editor: boolean;
        transition: boolean;
        viewer: boolean;
    };
    public showScroller = true;

    public ipFilter: string = null;

    private objectKey: string;
    private objectType: string;
    private MAGIC = 100; // number of items per page on server
    private filterDebouncer: IPromise<any> = null;

    constructor(private $scope: angular.IScope,
                private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private $timeout: ng.ITimeoutService,
                private $anchorScroll: ng.IAnchorScrollService,
                private queryParametersService: IQueryParametersService,
                private moreSpecificsService: IMoreSpecificsDataService) {

        this.show = {
            editor: false,
            transition: false,
            viewer: true,
        };
        this.objectKey = $state.params.objectName;
        this.objectType = $state.params.objectType.toLowerCase();

        this.canHaveMoreSpecifics = false;

        this.getResourcesFromBackEnd();
        this.queryParametersService.getWhoisObject(this.objectKey, this.objectType, "RIPE").then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                const results = response.data.objects.object;
                if (results.length >= 1) {
                    this.details = results[0];
                    this.resource = {
                        orgName: "",
                        resource: this.details["primary-key"].attribute[0].value,
                        type: this.objectType,
                    };
                    for (const attr of this.details.attributes.attribute) {
                        if (attr.name === "status") {
                            this.flags.unshift(attr.value);
                        } else if (attr.name === "netname" || attr.name === "as-name") {
                            this.flags.push(attr.value);
                        }
                    }
                }
            }, () => {
                this.whoisResponse = null;
            });
    }

    public updateButtonClicked(o: any): void {
        this.show.transition = true;
        this.$timeout(() => {
            this.show.viewer = !this.show.viewer;
            this.show.editor = !this.show.editor;
            this.$scope.$apply();
        }, 1000);
    }

    public backToMyResources(): void {
        this.$state.go("webupdates.myresources");
    }

    public showObjectEditor(): void {
        const params = {
            name: this.resource.resource,
            objectType: this.resource.type,
            source: "RIPE",
        };
        this.$state.go("webupdates.modify", params);
    }

    public showDetail(resource: IResourceModel): void {
        this.$state.go("webupdates.myresourcesdetail", {
            objectName: resource.resource,
            objectType: resource.type,
        });
    }

    /**
     * Called by 'scroller' directive.
     */
    public almostOnScreen(): void {
        if (this.nrMoreSpecificsToShow < this.moreSpecifics.resources.length) {
            this.nrMoreSpecificsToShow += 50;
            this.$scope.$apply();
        } else if (this.moreSpecifics.resources.length < this.moreSpecifics.filteredSize) {
            // resources still left on server? which ones? Use some magic!!!
            const pageNr = Math.ceil(this.moreSpecifics.resources.length / this.MAGIC);
            this.getResourcesFromBackEnd(pageNr, this.ipFilter);
            this.nrMoreSpecificsToShow += 50;
            this.$scope.$apply();
        }
        this.calcScroller();
    }

    public applyFilter(): void {
        if (this.filterDebouncer != null) {
            this.$timeout.cancel(this.filterDebouncer);
        }
        this.filterDebouncer = this.$timeout(() => {
            return this.getResourcesFromBackEnd(0, this.ipFilter);
        }, 400);
    }


    public isValidPrefix(maybePrefix: string): boolean {
        if (!this.serverSideForcedValidFilter) {
            return false;
        }
        if (!maybePrefix) {
            return false;
        }
        return IpAddressService.isValidV4(maybePrefix)
            || IpAddressService.isValidRange(maybePrefix)
            || IpAddressService.isValidV6(maybePrefix);
    }

    public formatAsPrefix(range: string): string {
        return this.ipAddressService.formatAsPrefix(range);
    }

    private getResourcesFromBackEnd(pageNr = 0, ipFilter = ""): boolean {
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            this.moreSpecificsService.getSpecifics(this.objectKey, this.objectType, pageNr, ipFilter).then(
                (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {

                    // More MAGIC! assume the next result follow the earlier ones, otherwise we need to track previous
                    // response sizes and work out how they fit with this lot.
                    if (pageNr === 0) {
                        this.moreSpecifics = response.data;
                    } else {
                        this.moreSpecifics.resources = this.moreSpecifics.resources.concat(response.data.resources);
                    }
                    this.canHaveMoreSpecifics = true;
                    this.calcScroller();

                }, () => {
                    //this.serverSideForcedValidFilter = false;
                    this.calcScroller();
                });
        }
        return true;
    }

    private calcScroller(): void {
        this.showScroller = this.nrMoreSpecificsToShow < this.moreSpecifics.filteredSize;
        this.$timeout(() => {
            this.$scope.$apply();
        }, 10);
    }
}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
