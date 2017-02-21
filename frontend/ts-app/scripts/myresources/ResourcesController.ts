class ResourcesController {
    public static $inject = ["$log", "IMyResourcesDataService"];
    public ipv4Resources: Ipv4Resource[];

    constructor(private $log: angular.ILogService,
                private resourcesDataService: IMyResourcesDataService) {
        this.ipv4Resources = this.resourcesDataService.getIpv4Resources();
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
