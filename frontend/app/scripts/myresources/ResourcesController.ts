class ResourcesController {
    public static $inject = ["$log", "MyResourcesDataService"];
    public ipv4Resources: IPv4ResourceDetails[];

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private resourcesDataService: MyResourcesDataService) {

        this.ipv4Resources = [];
        $rootScope.$on("organisation-changed-event", (event: IAngularEvent, selectedOrg: Organisation) => {
            this.resourcesDataService.getIpv4Resources(selectedOrg.orgId, (response) => {
                this.ipv4Resources = response.details;
            });
        });
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
