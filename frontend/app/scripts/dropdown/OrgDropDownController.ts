class OrgDropDownController {
    public static $inject = ["$log", "OrgDropDownDataService", "$cookies"];

    public organisations: Organisation[];
    public selectedOrg: Organisation;
    public selectedOrgId: string;
    public modelOrgs: any[];
    private cookies: angular.cookies.ICookiesService;

    constructor(private $log: angular.ILogService,
                private orgDropDownDataService: OrgDropDownDataService,
                private $cookies: angular.cookies.ICookiesService) {

        this.cookies = $cookies;
        const self = this;
        this.orgDropDownDataService.getOrgs().then((o: Organisation[]) => {
            self.organisations = o;
            const selectedOrg = self.getSelectedOrganisation();
            if (selectedOrg && selectedOrg.trim() !== "") {
                self.selectedOrgId = selectedOrg;
                self.selectedOrg = o.find((org) => org.orgId === selectedOrg);
            } else {
                self.selectedOrgId = o[0].activeOrg;
                self.selectedOrg = o[0];
            }
            self.modelOrgs = self.organisations.map((org) => {
                return { name: org.name, value: org.activeOrg};
            });
            self.updateOrganisation();
        });

    }

    public updateOrganisation() {
        this.cookies.put("activeMembershipId",
            this.selectedOrgId,
            {domain: ".ripe.net", secure: true});
    }

    public getSelectedOrganisation(): string {
        return this.cookies.get("activeMembershipId");
    }
}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
