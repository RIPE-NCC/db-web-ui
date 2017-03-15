class OrgDropDownStateService implements IOrgDropDownStateService {

    public static $inject = ["$cookies", "$log", "OrgDropDownDataService"];

    private organisations: Organisation[];
    private selectedOrg: Organisation;

    constructor(private $cookies: angular.cookies.ICookiesService,
                private $log: angular.ILogService,
                private orgDropDownDataService: IOrgDropDownDataService) {
    }

    public getOrgs(): IPromise<Organisation[]> {
        return this.orgDropDownDataService.getOrgs().then((organisations: Organisation[]) => {
            this.organisations = organisations;
            return this.organisations;
        });
    }

    public getSelectedOrg(): IPromise<Organisation> {
        return this.getOrgs().then((organisations: Organisation[]) => {

            const activeMembershipId = this.$cookies.get("activeMembershipId");
            if (activeMembershipId) {
                if (/^\d+$/.test(activeMembershipId)) {
                    // Cookie contains reg ID for an LIR
                    this.selectedOrg = _.find(this.organisations, (org: Organisation) => {
                        return activeMembershipId === org.memberId;
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
            }
            if (!this.selectedOrg) {
                this.selectedOrg = this.organisations && this.organisations.length && this.organisations[0];
            }
            this.setSelectedOrg(this.selectedOrg);
            return this.selectedOrg;
        });

    }

    public setSelectedOrg(org: Organisation) {
        if (!org) {
            return;
        }
        this.$cookies.put("activeMembershipId",
            org.regId ? org.memberId : "org:" + org.orgId,
            {path: "/", domain: ".ripe.net", secure: true});

    }
}

angular.module("dbWebApp").service("OrgDropDownStateService", OrgDropDownStateService);
