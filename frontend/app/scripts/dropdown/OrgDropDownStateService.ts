
class OrgDropDownStateServiceImpl implements OrgDropDownStateService {

    static $inject = ['$log', 'OrgDropDownDataService'];

    constructor(private $log: angular.ILogService,
                private orgDropDownDataService: OrgDropDownDataService) {
    }

    public getOrgs(): IPromise<Organisation[]> {
        return this.orgDropDownDataService.getOrgs();
    }

    // public getOrg(): Organisation;

    // public setOrg(orgId: Organisation|string): void;
}

angular.module("dbWebApp").service("OrgDropDownStateService", OrgDropDownStateServiceImpl);
