class OrgDropDownController {
    public static $inject = ["$log", "OrgDropDownDataService"];

    public organisations: Organisation[];

    constructor(private $log: angular.ILogService,
                private orgDropDownDataService: OrgDropDownDataService) {

        let self = this;
        this.orgDropDownDataService.getOrgs().then((o: Organisation[]) => self.organisations = o)
    }
}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
