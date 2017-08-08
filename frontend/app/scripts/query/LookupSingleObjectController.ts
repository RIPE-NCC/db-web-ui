interface ILookupState extends ng.ui.IStateParamsService {
    source: string;
    type: string;
    key: string;
}

class LookupSingleObjectController {

    public static $inject = ["$log", "$state", "$stateParams", "WhoisDataService", "QueryParametersService"];

    public whoisResponse: IWhoisObjectModel;

    private source: string;
    private objectType: string;
    private objectName: string;

    constructor(private $log: angular.ILogService,
                private $state: angular.ui.IStateService,
                private $stateParams: ILookupState,
                private WhoisDataService: WhoisDataService,
                private QueryParametersService: IQueryParametersService) {

        this.source = $stateParams.source;
        this.objectType = $stateParams.type;
        this.objectName = $stateParams.key;

        if (this.source && this.objectType && this.objectName) {
            const types = {};
            types[this.objectType] = true;
            this.QueryParametersService
                .searchWhoisObjects(this.objectName, this.source, types, "rB", {})
                .then(
                    (response: IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
                        if (response.data &&
                            response.data.objects &&
                            response.data.objects.object &&
                            response.data.objects.object.length === 1) {
                            this.whoisResponse = response.data.objects.object[0];
                        } else {
                            this.$log.warn(
                                "Expected a single object from query. source:", this.source,
                                "type:", this.objectType,
                                "name:", this.objectName);
                        }
                    });
        } else {
            this.$log.warn("Lookup parameter is null");
        }
    }

    public goToUpdate() {
        console.log("oh-oh", arguments);
        const params = {
            name: this.objectName,
            objectType: this.objectType,
            source: this.source,
        };
        this.$state.go("webupdates.modify", params);
    }
}

angular.module("dbWebApp").controller("LookupSingleObjectController", LookupSingleObjectController);
