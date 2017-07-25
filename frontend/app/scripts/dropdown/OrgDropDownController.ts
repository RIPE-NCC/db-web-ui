class OrgDropDownController {
    public static $inject = ["$log", "$rootScope", "$scope", "UserInfoService"];

    public selectedOrg: IUserInfoOrganisation;
    public organisations: IUserInfoOrganisation[] = [];

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private UserInfoService: UserInfoService) {
    }

    public $onInit(): void {
        const orgs: IUserInfoOrganisation[] = [];
        this.UserInfoService.getUserOrgsAndRoles()
            .then((userInfo: IUserInfoResponseData) => {
                if (angular.isArray(userInfo.organisations)) {
                    for (const org of userInfo.organisations) {
                        orgs.push(org);
                    }
                }
                if (angular.isArray(userInfo.members)) {
                    for (const org of userInfo.members) {
                        orgs.push(org);
                    }
                }
                orgs.sort((o1, o2) => {
                    return o1.organisationName.localeCompare(o2.organisationName);
                });
                this.organisations = orgs;
                this.UserInfoService.getSelectedOrganisation().then((org) => {
                    if (this.selectedOrg !== org) {
                        this.$rootScope.$broadcast("selected-org-changed", org);
                        this.selectedOrg = org;
                    }
                });
            });
    }

    public organisationSelected(): void {
        this.$rootScope.$broadcast("selected-org-changed", this.selectedOrg);
        this.UserInfoService.setSelectedOrganisation(this.selectedOrg);
    }

}

angular
    .module("dbWebApp")
    .controller("OrgDropDownController", OrgDropDownController);
