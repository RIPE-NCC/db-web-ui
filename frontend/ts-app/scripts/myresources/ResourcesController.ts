class ResourcesController {
    public static $inject = ["$log", "IMyResourcesDataService"];
    public ipv4Allocations: Ipv4Allocation[];
    public ipv4Assignments: Ipv4Assignment[];

    constructor(private $log: angular.ILogService,
                private resourcesDataService: IMyResourcesDataService) {
        this.ipv4Allocations = this.resourcesDataService.getIpv4Allocations();
        this.ipv4Assignments = this.resourcesDataService.getIpv4Assignments();
    }

}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
