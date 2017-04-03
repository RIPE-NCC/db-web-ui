interface IResourceDetailsControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class ResourceDetailsController {

    public static $inject = ["$scope", "$log", "$state", "QueryParametersService", "MoreSpecificsService"];
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

    private objectKey: string;
    private objectType: string;
    private MAGIC = 100; // number of items per page on server

    constructor(private $scope: angular.IScope,
                private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
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
        this.getResourcesFromBackEnd(0);

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
        setTimeout(() => {
            this.show.viewer = !this.show.viewer;
            this.show.editor = !this.show.editor;
            this.$scope.$apply();
        }, 1000);
    }

    public backToMyResources(): void {
        this.$state.go("webupdates.myresources");
    }

    public showDetail(resource: IResourceModel): void {
        this.$state.go("webupdates.myresourcesdetail", {
            objectName: resource.resource,
            objectType: resource.type,
        });
    }

    /**
     * Called by 'scroller' directive. Return true to indicate there are no more rows to show.
     *
     * @returns {boolean}
     */
    public almostOnScreen() {
        if (this.nrMoreSpecificsToShow < this.moreSpecifics.resources.length) {
            this.nrMoreSpecificsToShow += 50;
            this.$scope.$apply();
        } else if (this.moreSpecifics.resources.length < this.moreSpecifics.resourcesSize) {
            // resources still left on server? Use some magic!!!
            const pageNr = Math.ceil(this.moreSpecifics.resources.length / this.MAGIC);
            this.getResourcesFromBackEnd(pageNr);
        } else {
            return true;
        }
    }

    private getResourcesFromBackEnd(pageNr: number) {
        // console.log('PAGE >>> ', pageNr);
        if (typeof pageNr !== "number") {
            pageNr = 0;
        }
        if (this.objectType === "inetnum" || this.objectType === "inet6num") {
            this.moreSpecificsService.getSpecifics(this.objectKey, this.objectType, pageNr).then(
                (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {

                    // More MAGIC! assume the next result follow the earlier ones
                    if (pageNr === 0) {
                        this.moreSpecifics = response.data;
                    } else {
                        this.moreSpecifics.resources = this.moreSpecifics.resources.concat(response.data.resources);
                    }
                    this.canHaveMoreSpecifics = true;
                });
        }

    }
}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
