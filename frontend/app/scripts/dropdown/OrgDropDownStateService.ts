class OrgDropDownStateService implements IOrgDropDownStateService {

    public static $inject = ["$cookies", "$log", "OrgDropDownDataService"];

    private organisations: Organisation[];
    private selectedOrg: Organisation;

    constructor(private $cookies: angular.cookies.ICookiesService,
                private $log: angular.ILogService,
                private orgDropDownDataService: IOrgDropDownDataService) {
    }

    public getOrgs(): IPromise<Organisation[]> {
        return this.orgDropDownDataService.getOrgs().then((o: Organisation[]) => {
            this.organisations = o;
            return this.organisations;
        });
    }

    public getSelectedOrg(): Organisation {
        if (this.selectedOrg) {
            return this.selectedOrg;
        }
        const activeMembershipId = this.$cookies.get("activeMembershipId");
        if (!activeMembershipId) {
            // If there's not cookie, use the first one in the list
            this.selectedOrg = this.organisations && this.organisations.length && this.organisations[0];
            if (this.selectedOrg) {
                this.setSelectedOrg(this.selectedOrg);
            }
        } else if (/^\d+$/.test(activeMembershipId)) {
            // Cookie contains reg ID for an LIR
            this.selectedOrg = _.find(this.organisations, (org: Organisation) => {
                return activeMembershipId === org.regId;
            });
        } else {
            // Cookie contains and end-user org id
            const splitOrgId = activeMembershipId.split(":");
            if (splitOrgId.length === 2 && splitOrgId[0] === "org") {
                this.selectedOrg = _.find(this.organisations, (org: Organisation) => {
                    return splitOrgId[1] === org.orgId;
                });
            }
        }
        return this.selectedOrg;
    }

    public setSelectedOrg(org: Organisation) {
        this.selectedOrg = org;
        this.$cookies.put("activeMembershipId",
            org.regId ? org.regId : "org:" + org.orgId,
            {path: "/", domain: ".ripe.net", secure: true});

    }
}

angular.module("dbWebApp").service("OrgDropDownStateService", OrgDropDownStateService);
