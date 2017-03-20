interface IResourceItemControllerState extends ng.ui.IStateService {
    objectName: string;
}

class ResourceDetailsController {

    public static $inject = ["$log", "$state", "QueryParametersService", "MoreSpecificsService"];
    public whoisResponse: IWhoisResponseModel;
    public results: IWhoisObjectModel[];
    public details: IWhoisObjectModel;
    public moreSpecifics: IMoreSpecificResource[];

    constructor(private $log: angular.ILogService,
                private $state: IResourceItemControllerState,
                private queryParametersService: IQueryParametersService,
                private moreSpecificsService: IMoreSpecificsService) {

        moreSpecificsService.getSpecifics($state.params['objectName']).then(
            (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {
                this.moreSpecifics = response.data.resources;
                $log.info("more specifics: ", this.moreSpecifics);
            }
        );

        $log.info("ResourceDetailsController", $state.params['objectName']);
        this.queryParametersService.fireQuery($state.params['objectName'], "RIPE", {}, "", {}).then(
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
    .controller("ResourceDetailsController", ResourceDetailsController);
