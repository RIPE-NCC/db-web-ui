class OrgDropDownDataServiceImpl implements OrgDropDownDataService {

    getLirs(): Lir[] {
        return [
            {
                membershipId: 3629,
                regId: "nl.surfnet",
                organisationName: "SURFnet bv",
                serviceLevel: "NORMAL",
                orgId: "ORG-Sb3-RIPE"
            },
            {
                membershipId: 7347,
                regId: "zz.example",
                organisationName: "Internet Provider BV",
                serviceLevel: "NORMAL",
                orgId: "ORG-EIP1-RIPE"
            }
        ];
    }

    getOrganisation(): Organisation[] {
        return [
            {
                id: "ORG-LW32-RIPE",
                name: "Leo Woodward"
            },
            {
                id: "ORG-AA802-RIPE",
                name: "AOT-HOSTING"
            }];
    }

    public static $inject = ["$log"];

    constructor(private $log: angular.ILogService) {

    }

}

angular.module("dbWebApp").service("OrgDropDownDataService", OrgDropDownDataServiceImpl);
