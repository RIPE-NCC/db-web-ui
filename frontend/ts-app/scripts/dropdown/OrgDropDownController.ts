class OrgDropDownController {
    public static $inject = ["$log", "OrgDropDownDataService"];

    public organisations: Organisation[];

    constructor(private $log: angular.ILogService,
                private orgDropDownDataService: OrgDropDownDataService) {
        let lirs = this.orgDropDownDataService.getLirs();
        let orgs = this.orgDropDownDataService.getOrganisation();

        let lirOrgs = lirs.map((lir) => {
            return { id: lir.orgId, name: lir.regId + ", " + lir.organisationName } as Organisation;
        });

        this.organisations = lirOrgs.concat(orgs);
    }
}

angular.module("dbWebApp").controller("OrgDropDownController", OrgDropDownController);
