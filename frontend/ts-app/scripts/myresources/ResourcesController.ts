class ResourcesController {
    public static $inject = ["$log", "MyResourcesDataService"];
    public ipv4Resources: any;

    constructor(private $log: angular.ILogService,
                private resourcesDataService: MyResourcesDataService) {
        this.ipv4Resources = [];
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
