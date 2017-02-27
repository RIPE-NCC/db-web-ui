class OrgDropDownStateService implements IOrgDropDownStateService {

    public static $inject = ["$log", "OrgDropDownDataService"];

    private organisations: Organisation[];
    private selectedOrg: Organisation;

    constructor(private $log: angular.ILogService,
                private orgDropDownDataService: IOrgDropDownDataService) {
    }

    public getOrgs(): IPromise<Organisation[]> {

        return this.orgDropDownDataService.getOrgs().then((o: Organisation[]) => {
            this.organisations = o;
            return this.organisations;
        });
    }

    public getSelectedOrg(): Organisation {
        // TODO: set the selected organization based on the cookie, otherwise choose the first one in the list
        return this.selectedOrg;
    }

    public setSelectedOrg(org: Organisation) {
        this.selectedOrg = org;
    }
}

angular.module("dbWebApp").service("OrgDropDownStateService", OrgDropDownStateService);
