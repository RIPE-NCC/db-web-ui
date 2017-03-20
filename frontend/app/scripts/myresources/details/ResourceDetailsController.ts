import * as angular from 'angular';
import {NgTableParams} from "ng-table/src/core/ngTableParams";

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
    public moreSpecificsData: IMoreSpecificResource[];
    public moreSpecifics: NgTableParams<IMoreSpecificResource>;

    constructor(private $log: angular.ILogService,
                private $state: IResourceItemControllerState,
                private queryParametersService: IQueryParametersService,
                private moreSpecificsService: IMoreSpecificsService) {

        const self = this;
        moreSpecificsService.getSpecifics($state.params['objectName']).then(
            (response: IHttpPromiseCallbackArg<IMoreSpecificsApiResult>) => {
                self.moreSpecificsData = response.data.resources;
                self.moreSpecifics = new NgTableParams<IMoreSpecificResource>({}, {
                    dataset: self.moreSpecificsData,
                    total: self.moreSpecificsData.length
                });

                $log.info("more specifics: ", this.moreSpecificsData);
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
