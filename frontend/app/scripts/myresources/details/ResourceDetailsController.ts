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
    public moreSpecifics: IMoreSpecificResource[];
    public resource: any;
    public flags: string[] = [];
    public canHaveMoreSpecifics: boolean;
    public nrMoreSpecificsToShow: number = 10;
    public show: {
        editor: boolean;
        transition: boolean;
        viewer: boolean;
    };

    constructor(private $scope: angular.IScope,
                private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private queryParametersService: IQueryParametersService,
                private moreSpecificsService: IMoreSpecificsService) {

        this.show = {
            editor: false,
            transition: false,
            viewer: true,
        };
        const objectKey = $state.params.objectName;
        const objectType = $state.params.objectType.toLowerCase();

        this.canHaveMoreSpecifics = false;
        if (objectType === "inetnum" || objectType === "inet6num") {
            moreSpecificsService.getSpecifics(objectKey, objectType).then(
                (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {
                    this.moreSpecifics = response.data.resources;
                    this.canHaveMoreSpecifics = true;
                });
        }

        this.queryParametersService.getWhoisObject(objectKey, objectType, "RIPE").then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                const results = response.data.objects.object;
                if (results.length >= 1) {
                    this.details = results[0];
                    this.resource = {
                        orgName: "",
                        resource: this.details["primary-key"].attribute[0].value,
                        type: objectType,
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

    public almostOnScreen() {
        if (this.nrMoreSpecificsToShow < this.moreSpecifics.length) {
            this.nrMoreSpecificsToShow += 10;
            this.$scope.$apply();
        }
    }

}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
