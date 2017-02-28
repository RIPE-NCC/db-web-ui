class OrgDropDownStateService implements IOrgDropDownStateService {

    public static $inject = ["$log", "OrgDropDownDataService", "$cookies"];

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
        return this.selectedOrg;
    }

    public setSelectedOrg(org: Organisation) {
        this.selectedOrg = org;
    }
}

angular.module("dbWebApp").service("OrgDropDownStateService", OrgDropDownStateService);
