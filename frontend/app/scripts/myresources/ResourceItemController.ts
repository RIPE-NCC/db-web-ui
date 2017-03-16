interface IResourceItemControllerState extends ng.ui.IStateService {
    objectName: string;
}

class ResourceItemController {

    public static $inject = ["$log", "$state", "QueryParametersService"];
    public whoisResponse: IWhoisResponseModel;
    public results: IWhoisObjectModel[];
    public details: IWhoisObjectModel;

    constructor(private $log: angular.ILogService,
                private $state: IResourceItemControllerState,
                private queryParametersService: IQueryParametersService) {
        // $log.info("ResourceItemController", $state.params.objectName);
        this.queryParametersService.fireQuery($state.params.objectName, "RIPE", {}, "", {}).then(
            (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                this.whoisResponse = response.data;
                this.results = response.data.objects.object;
                this.$log.debug("Set results: ", this.results);
                if (this.results.length >= 1) {
                    this.details = this.results[0];
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
