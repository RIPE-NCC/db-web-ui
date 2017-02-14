class ResourcesController {
    public static $inject = ["$log", "MyResourcesDataService"];
    public ipv4Allocations: Ipv4Allocation[];
    private ipv4Assignments: Ipv4Assignment[];

    constructor(private $log: angular.ILogService,
                private resourcesDataService: MyResourcesDataService) {
        this.ipv4Allocations = this.resourcesDataService.getIpv4Allocations();
        this.ipv4Assignments = this.resourcesDataService.getIpv4Assignments();
    }

    public editResource(resource: Ipv4Allocation) {
        this.$log.debug("edit resource clicked", resource);
    }

}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
