class OrgDropDownController {
    public static $inject = ["$cookies", "$log", "$scope", "OrgDropDownStateService"];

    public organisations: Organisation[];
    public selectedOrg: {name: string, value: string};
    public modelOrgs: Array<{name: string, value: string}>;

    constructor(private $cookies: angular.cookies.ICookiesService,
                private $log: angular.ILogService,
                private $scope: angular.IScope,
                private orgDropDownStateService: OrgDropDownStateService,
                ) {
        this.orgDropDownStateService.getOrgs().then((o: Organisation[]) => {
            this.organisations = o;
            this.modelOrgs = this.organisations.map((org) => {
                return { name: org.name, value: org.activeOrg};
            });

            if (this.modelOrgs.length > 0) {
                const activeOrganisation = this.getSelectedOrganisation();
                if (angular.isString(activeOrganisation) && activeOrganisation.length > 0) {
                    const found = this.modelOrgs.find((_o) => _o.value === activeOrganisation);
                    if (found) {
                        this.selectedOrg = found;
                        orgDropDownStateService.setSelectedOrg(found);
                    } else {
                        this.selectedOrg = this.modelOrgs[0];
                        orgDropDownStateService.setSelectedOrg(this.modelOrgs[0]);
                    }
                } else {
                    this.selectedOrg = this.modelOrgs[0];
                    orgDropDownStateService.setSelectedOrg(this.modelOrgs[0]);
                }
            }

            this.updateOrganisation();
        });
    }

    public updateOrganisation() {
        // TODO: [ES] move down to StateService, and also ALWAYS update the cookie
        if (this.selectedOrg) {
            this.orgDropDownStateService.setSelectedOrg(this.selectedOrg);
            this.$cookies.put("activeMembershipId",
                this.selectedOrg.value,
                {path: "/", domain: ".ripe.net", secure: true});
            this.$scope.$emit("organisation-changed-event", this.selectedOrg.value);
        }
    }

    public getSelectedOrganisation(): string {
        return this.$cookies.get("activeMembershipId");
    }
}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
