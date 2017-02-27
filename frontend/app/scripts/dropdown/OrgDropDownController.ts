class OrgDropDownController {
    public static $inject = ["$log", "OrgDropDownDataService", "$cookies"];

    public organisations: Organisation[];
    public selectedOrg: {name: string, value: string};
    public modelOrgs: {name: string, value: string}[];
    private cookies: angular.cookies.ICookiesService;

    constructor(private $log: angular.ILogService,
                private orgDropDownDataService: OrgDropDownDataService,
                private $cookies: angular.cookies.ICookiesService) {

        this.cookies = $cookies;
        const self = this;
        this.orgDropDownDataService.getOrgs().then((o: Organisation[]) => {
            self.organisations = o;
            self.modelOrgs = self.organisations.map((org) => {
                return { name: org.name, value: org.activeOrg};
            });

            const org = self.getSelectedOrganisation();
            if (angular.isString(org) && org.length) {
                self.selectedOrg = self.modelOrgs.find((_o) => _o.value === org);
            } else if (self.modelOrgs.length > 0) {
                self.selectedOrg = self.modelOrgs[0];
            } else {
                self.selectedOrg = undefined;
            }

            self.updateOrganisation();
        });

    }

    public updateOrganisation() {
        if (this.selectedOrg) {
            this.cookies.put("activeMembershipId",
                this.selectedOrg.value,
                {path: "/", domain: ".ripe.net", secure: true});
        }
        //
    }

    public getSelectedOrganisation(): string {
        return this.cookies.get("activeMembershipId");
    }
}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
