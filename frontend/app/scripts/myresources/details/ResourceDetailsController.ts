
interface IResourceDetailsControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class ResourceDetailsController {

    public static $inject = ["$log", "$state", "QueryParametersService", "MoreSpecificsService"];
    public whoisResponse: IWhoisResponseModel;
    public details: IWhoisObjectModel;
    public moreSpecifics: IMoreSpecificResource[];
    public resource: any;
    public hasMoreSpecifics: boolean;

    constructor(private $log: angular.ILogService,
                private $state: IResourceDetailsControllerState,
                private queryParametersService: IQueryParametersService,
                private moreSpecificsService: IMoreSpecificsService) {

        const objectKey = $state.params.objectName;
        const objectType = $state.params.objectType;

        this.hasMoreSpecifics = false;
        if (objectType === "inetnum" || objectType === "inet6num") {
            moreSpecificsService.getSpecifics(objectKey, objectType).then(
                (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {
                    this.moreSpecifics = response.data.resources;
                    this.hasMoreSpecifics = this.moreSpecifics.length > 0;
                }
            );
        }

        this.queryParametersService.getResource(objectKey, "RIPE", objectType).then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                const results = response.data.objects.object;
                if (results.length >= 1) {
                    this.details = results[0];
                    this.resource = {
                        orgName: "WDE (not always present)",
                        resource: this.details["primary-key"].attribute[0].value,
                        status: "OK",
                        type: this.details.type,
                    };
                }
            }, () => {
                this.whoisResponse = null;
            });
    }

    public backToMyResources(): void {
        this.$state.transitionTo("webupdates.myresources");
    }

    public showDetail(resource: IResourceModel): void {
        this.$state.transitionTo("webupdates.myresourcesdetail", {
            objectName: resource.resource,
            objectType: resource.type,
        });
    }

}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
