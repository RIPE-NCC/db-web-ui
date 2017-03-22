
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

        const objectKey = ResourceDetailsController.objectKey($state);
        const objectType = $state.params.objectType;

        this.hasMoreSpecifics = objectType === "inetnum" || objectType === "inet6num";
        if (this.hasMoreSpecifics) {
            moreSpecificsService.getSpecifics(objectKey, objectType).then(
                (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {
                    this.moreSpecifics = response.data.resources;
                }
            );
        }

        const types = {};
        types[objectType] = true;
        $log.info("objectKey = ", objectKey);
        this.queryParametersService.fireQuery(objectKey, "RIPE", types, "r", {}).then(
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

    private static objectKey(state: IResourceDetailsControllerState) : string {
        return state.params.objectName;
    }

    public backToMyResources(): void {
        this.$state.transitionTo("webupdates.myresources");
    }

}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
