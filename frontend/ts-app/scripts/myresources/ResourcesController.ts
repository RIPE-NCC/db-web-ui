class ResourcesController {
    public static $inject = ["$log", "MyResourcesService"];
    public ipv4Resources: any;

    constructor(private $log: angular.ILogService,
                private resourcesService: MyResourcesService) {
        this.ipv4Resources = [];
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
