class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

    public static $inject = ["$log"];

    constructor(private $log: angular.ILogService) {
    }

    getOrganisations(): Organisation[] {
        return undefined;
    }

    public getLirs(): Lir[] {
        return [];
    }
}

angular
    .module("dbWebApp")
    .service("OrgDropDownDataService", OrgDropDownDataServiceImpl);
