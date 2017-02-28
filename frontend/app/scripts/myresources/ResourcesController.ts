class ResourcesController {
    public static $inject = ["$log", "$scope", "MyResourcesDataService"];
    public ipv4Resources: IPv4ResourceDetails[];

    constructor(private $log: angular.ILogService,
                private $scope: angular.IScope,
                private resourcesDataService: MyResourcesDataService) {

        this.ipv4Resources = [];
        $scope.$on("organisation-changed-event", (event: IAngularEvent, selectedOrg: Organisation) => {
            this.resourcesDataService.getIpv4Resources(selectedOrg.orgId, (response) => {
                this.ipv4Resources = response.details;
            });
        });
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
