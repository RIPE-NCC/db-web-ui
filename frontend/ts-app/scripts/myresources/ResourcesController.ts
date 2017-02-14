

class ResourcesController {
    public static $inject = ["$log", "MyResourcesDataService"];
    public ipv4Resources: Ipv4Resource[];

    constructor(private $log: angular.ILogService,
                private resourcesDataService: MyResourcesDataService) {

        this.ipv4Resources = this.resourcesDataService.getIpv4Resources();
        this.$log.debug(">>>>", "hey joe i've got resourceS ", this.ipv4Resources);
    }

    public editResource(resource: Ipv4Resource) {
        this.$log.debug("edit resource clicked", resource);
    }

}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
