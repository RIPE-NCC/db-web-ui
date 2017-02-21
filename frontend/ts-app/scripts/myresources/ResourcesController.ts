class ResourcesController {
    public static $inject = ["$log", "MyResourcesDataService"];
    public ipv4Resources: Ipv4Resource[];

    constructor(private $log: angular.ILogService,
                private resourcesDataService: MyResourcesDataService) {
        this.ipv4Resources = this.resourcesDataService.getIpv4Resources();
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
