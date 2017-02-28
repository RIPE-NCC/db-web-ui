class OrgDropDownController {
    public static $inject = ["$log", "$rootScope", "OrgDropDownStateService"];

    public organisations: Organisation[];
    public selectedOrg: Organisation;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private orgDropDownStateService: OrgDropDownStateService) {

            this.orgDropDownStateService.getOrgs().then((o: Organisation[]) => {
                this.organisations = o;
                this.selectedOrg = this.orgDropDownStateService.getSelectedOrg();
            });
    }

    public updateOrganisation() {
        this.orgDropDownStateService.setSelectedOrg(this.selectedOrg);
        this.$rootScope.$broadcast("organisation-changed-event", this.selectedOrg);

    }

}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
