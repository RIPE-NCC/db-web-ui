class OrgDropDownController {
    public static $inject = ["$log", "OrgDropDownStateService", "$cookies"];

    public organisations: Organisation[];
    public selectedOrg: {name: string, value: string};
    public modelOrgs: {name: string, value: string}[];
    private cookies: angular.cookies.ICookiesService;

    constructor(private $log: angular.ILogService,
                private orgDropDownStateService: OrgDropDownStateService,
                private $cookies: angular.cookies.ICookiesService) {

        this.cookies = $cookies;
        this.orgDropDownStateService.getOrgs().then((o: Organisation[]) => {
            this.organisations = o;
            this.modelOrgs = this.organisations.map((org) => {
                return { name: org.name, value: org.activeOrg};
            });
            this.modelOrgs = [];

            if (this.modelOrgs.length > 0) {
                const activeOrganisation = this.getSelectedOrganisation();
                if (angular.isString(activeOrganisation) && activeOrganisation.length > 0) {
                    const found = this.modelOrgs.find((_o) => _o.value === activeOrganisation);
                    if (found) {
                        this.selectedOrg = found;
                    } else {
                        this.selectedOrg = this.modelOrgs[0];
                    }
                } else {
                    this.selectedOrg = this.modelOrgs[0];
                }
            }

            this.updateOrganisation();
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
