interface IResourceItemControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
}

class ResourceItemController {

    public static $inject = ["$log", "$state", "QueryParametersService"];
    public whoisResponse: IWhoisResponseModel;
    public results: IWhoisObjectModel[];
    public details: IWhoisObjectModel;
    public resource: any;

    constructor(private $log: angular.ILogService,
                private $state: IResourceItemControllerState,
                private queryParametersService: IQueryParametersService) {

        const types = {};
        types[$state.params.objectType] = true;
        this.queryParametersService.fireQuery($state.params.objectName, "RIPE", types, "r", {}).then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                this.results = response.data.objects.object;
                if (this.results.length >= 1) {
                    this.details = this.results[0];
                    this.resource = {
                        orgName: "WDE (not always present)",
                        resource: this.details["primary-key"].attribute[0].value,
                        status: "OK",
                        type: this.details.type,
                    };
                }
            }, () => {
                this.whoisResponse = null;
                this.results = [];
            });
    }

}

angular
    .module("dbWebApp")
    .controller("ResourceItemController", ResourceItemController);
