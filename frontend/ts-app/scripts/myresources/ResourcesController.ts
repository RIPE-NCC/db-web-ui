class ResourcesController {
    public static $inject = ["$log", "MyResourcesDataService"];
    public ipv4Resources: IPv4ResourceDetails[];

    constructor(private $log: angular.ILogService,
                private resourcesDataService: MyResourcesDataService) {
        this.ipv4Resources = [];
        this.resourcesDataService.getIpv4Resources('ORG-IOB1-RIPE', (response) => {
            this.ipv4Resources = response.details;
        });
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
