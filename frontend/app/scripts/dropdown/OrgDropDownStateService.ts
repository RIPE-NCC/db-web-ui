
class OrgDropDownStateServiceImpl implements OrgDropDownStateService {

    static $inject = ['$log', 'OrgDropDownDataService'];

    private selectedOrg: {name: string, value: string};

    constructor(private $log: angular.ILogService,
                private orgDropDownDataService: OrgDropDownDataService) {
    }

    public getOrgs(): IPromise<Organisation[]> {
        return this.orgDropDownDataService.getOrgs();
    }

    public getSelectedOrg(): {name: string, value: string} {
        return this.selectedOrg;
    }

    public setSelectedOrg(org: {name: string, value: string}) {
        this.selectedOrg = org;
    }
}

angular.module("dbWebApp").service("OrgDropDownStateService", OrgDropDownStateServiceImpl);
