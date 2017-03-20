interface IResourceItemControllerState extends ng.ui.IStateService {
    params: {
        objectName: string;
        objectType: string;
    };
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

        // const types = {};
        // types[$state.params['objectType']] = true;
        // this.queryParametersService.fireQuery($state.params['objectName'], "RIPE", types, "r", {}).then(
        //     (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
        //         this.whoisResponse = response.data;
        //         this.results = response.data.objects.object;
        //         if (this.results.length >= 1) {
        //             this.details = this.results[0];
        //         }
        //     }, () => {
        //         this.whoisResponse = null;
        //         this.results = [];
        //     });
    }

}

angular
    .module("dbWebApp")
    .controller("ResourceDetailsController", ResourceDetailsController);
