class OrgDropDownController {
    public static $inject = ["$cookies", "$log", "$rootScope", "OrgDropDownStateService"];

    public organisations: Organisation[];
    public selectedOrg: Organisation;

    constructor(private $cookies: angular.cookies.ICookiesService,
                private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private orgDropDownStateService: OrgDropDownStateService) {

            this.orgDropDownStateService.getOrgs().then((o: Organisation[]) => {
                this.organisations = o;

                const activeMembershipId = this.$cookies.get("activeMembershipId");

                if (activeMembershipId) {
                    // select organisation from cookie
                    const finded = o.find((org) => org.memberId.toString() === activeMembershipId);
                    this.$log.info("finded " + finded);
                    this.selectedOrg = finded;
                    this.orgDropDownStateService.setSelectedOrg(finded);
                } else {
                    this.selectedOrg = o && o.length ? o[0] : null;
                    this.orgDropDownStateService.setSelectedOrg(this.selectedOrg);
                    // update cookies
                    this.$cookies.put("activeMembershipId",
                        this.selectedOrg.memberId.toString(),
                        {path: "/", domain: ".ripe.net", secure: true});

                }
            });
    }

    public updateOrganisation() {
        this.orgDropDownStateService.setSelectedOrg(this.selectedOrg);
        this.$cookies.put("activeMembershipId",
            this.selectedOrg.memberId.toString(),
            {path: "/", domain: ".ripe.net", secure: true});
        this.$rootScope.$broadcast("organisation-changed-event", this.selectedOrg);

    }

    public getSelectedOrganisation(): string {
        return this.$cookies.get("activeMembershipId");
    }

}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
