
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
    public canHaveMoreSpecifics: boolean;

    constructor(private $scope: angular.IScope,
                private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private queryParametersService: IQueryParametersService,
                private moreSpecificsService: IMoreSpecificsService) {

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

        this.queryParametersService.getResource(objectKey, objectType, "RIPE").then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                const results = response.data.objects.object;
                if (results.length >= 1) {
                    this.details = results[0];
                    this.resource = {
                        orgName: "",
                        resource: this.details["primary-key"].attribute[0].value,
                        // status: "OK",
                        type: objectType,
                    };
                }
            }, () => {
                this.whoisResponse = null;
            });
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

}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
