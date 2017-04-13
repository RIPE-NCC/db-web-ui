class OrgDropDownController {
    public static $inject = ["$log", "$rootScope", "OrgDropDownStateService"];

    public organisations: Organisation[]; // fills dropdown
    public selectedOrg: Organisation;     // selection bound to ng-model in widget

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private orgDropDownStateService: IOrgDropDownStateService) {

        this.orgDropDownStateService.getOrgs().then((organisations: Organisation[]) => {
            if (organisations) {
                this.organisations = organisations;
                this.selectedOrg = organisations[0];
                this.organisationSelected();
            }
        });
    }

    public organisationSelected(): void {
        this.notifyOrganisationChange(this.selectedOrg);
    }

    private notifyOrganisationChange(selected: Organisation): void {
        if (selected) {
            this.$rootScope.$broadcast("organisation-changed-event", selected);
            this.orgDropDownStateService.setSelectedOrganisation(selected);
        }
    }

}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
