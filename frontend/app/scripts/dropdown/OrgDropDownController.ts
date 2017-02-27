class OrgDropDownController {
    public static $inject = ["$cookies", "$log", "$rootScope", "OrgDropDownStateService"];

    public organisations: Organisation[];
    public selectedOrg: Organisation;

    constructor(private $cookies: angular.cookies.ICookiesService,
                private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private orgDropDownStateService: OrgDropDownStateService,) {
        this.orgDropDownStateService.getOrgs().then((o: Organisation[]) => {
            this.organisations = o;

            // TODO : read the selected organization based on the cookie
            this.selectedOrg = o && o.length ? o[0] : null;
        });
    }

    public updateOrganisation() {
        // TODO: [ES] move down to StateService, and also ALWAYS up date the cookie
        this.orgDropDownStateService.setSelectedOrg(this.selectedOrg);
        // this.$cookies.put("activeMembershipId",
        //     selectedOrg.value,
        //     {path: "/", domain: ".ripe.net", secure: true});
        this.$rootScope.$broadcast("organisation-changed-event", this.selectedOrg);

    }

    public getSelectedOrganisation(): string {
        return this.$cookies.get("activeMembershipId");
    }

}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
