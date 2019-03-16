interface ILookupState extends ng.ui.IStateParamsService {
    source: string;
    type: string;
    key: string;
}

class LookupSingleObjectController {

    public static $inject = ["$log", "$state", "$stateParams", "Properties", "LookupService"];

    public whoisResponse: IWhoisObjectModel;
    public error: string;

    private source: string;
    private objectType: string;
    private objectName: string;

    constructor(private $log: angular.ILogService,
                private $state: angular.ui.IStateService,
                private $stateParams: ILookupState,
                public properties: IProperties,
                private lookupService: ILookupService) {

        this.source = $stateParams.source;
        this.objectType = $stateParams.type;
        this.objectName = $stateParams.key;

        try {
            this.lookupService.lookupWhoisObject($stateParams).then(
                    (response: ng.IHttpPromiseCallbackArg<IWhoisResponseModel>) => {
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
        } catch (e) {
            this.error = "An error occurred looking for " + this.objectType + " " + this.objectName;
        }
    }

    public goToUpdate() {
        const params = {
            name: this.objectName,
            objectType: this.objectType,
            source: this.source,
        };
        this.$state.go("webupdates.modify", params);
    }
}

angular.module("dbWebApp")
    .component("lookupSingle", {
        controller: LookupSingleObjectController,
        templateUrl: "./lookup-single.html",
    });
