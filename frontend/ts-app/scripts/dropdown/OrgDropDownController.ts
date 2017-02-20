
class OrgDropDownController {
    public static $inject = ["$log", "$rootScope"];
    public searchExpanded: boolean;
    public webUpdatesExpanded: boolean;
    public passwordsExpanded: boolean;
    public activeUrl: string;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService) {



    }
}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
