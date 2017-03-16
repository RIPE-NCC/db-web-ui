class ResourceItemController {

    public static $inject = ["$log", "$state"];
    public details: IWhoisObjectModel;

    constructor(private $log: angular.ILogService,
                private $state: ng.ui.IStateService) {
        $log.info("ResourceItemController", $state);
    }

}

angular
    .module("dbWebApp")
    .controller("ResourceItemController", ResourceItemController);
