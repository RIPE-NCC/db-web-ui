import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

class ResourcesController {
    public static $inject = ["$log", "$scope", "MyResourcesDataService"];
    public ipv4Resources: IPv4ResourceDetails[] = [];

    constructor(private $log: angular.ILogService,
                private $scope: angular.IScope,
                private resourcesDataService: MyResourcesDataService) {

        $scope.$on("organisation-changed-event", (event: IAngularEvent, selectedOrg: Organisation) => {
            this.resourcesDataService.getIpv4Resources(selectedOrg.orgId)
                .then((response: IHttpPromiseCallbackArg<IPv4ResourcesResponse>) => {
                    this.ipv4Resources = response.data.details;
                });
        });
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);