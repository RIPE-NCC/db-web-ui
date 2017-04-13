class OrgDropDownStateService implements IOrgDropDownStateService {

    public static $inject = ["$cookies", "$log", "OrgDropDownDataService"];

    private selectedOrganisation: Organisation;

    constructor(private $cookies: angular.cookies.ICookiesService,
                private $log: angular.ILogService,
                private orgDropDownDataService: IOrgDropDownDataService) {
    }

    public getOrgs(): IPromise<Organisation[]> {
        return this.orgDropDownDataService.getOrgs();
    }

    public getSelectedOrganisation(): Organisation {
        return this.selectedOrganisation;
    }

    public setSelectedOrganisation(selectedOrganisation: Organisation): void {
        this.selectedOrganisation = selectedOrganisation;
    }
}

angular.module("dbWebApp").service("OrgDropDownStateService", OrgDropDownStateService);
