class OrgDropDownController {
    public static $inject = ["$log", "$rootScope", "OrgDropDownStateService"];

    public organisations: Organisation[]; // fills dropdown
    public selectedOrg: Organisation;     // selection bound to ng-model in widget

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private orgDropDownStateService: OrgDropDownStateService) {

        this.orgDropDownStateService.getOrgs().then((organisations: Organisation[]) => {
            this.organisations = organisations;
            this.orgDropDownStateService.getSelectedOrg().then((organisation: Organisation) => {
                this.selectedOrg = organisation;
                this.notifyOrganisationChange(this.selectedOrg);
            });
        });
    }

    public organisationSelected(): void {
        this.orgDropDownStateService.setSelectedOrg(this.selectedOrg);
        this.notifyOrganisationChange(this.selectedOrg);
    }

    private notifyOrganisationChange(selected: Organisation): void {
        if (selected) {
            this.$rootScope.$broadcast("organisation-changed-event", selected);
        }
    }

}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
