class OrgDropDownController {
    public static $inject = ["$log", "$rootScope", "$scope", "UserInfoService", "EnvironmentStatus"];

    public selectedOrg: IUserInfoOrganisation;
    public organisations: IUserInfoOrganisation[] = [];
    // Temporary until we need different application on Test, Training and RC environment
    public trainingEnv: boolean;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private UserInfoService: UserInfoService,
                private EnvironmentStatus: EnvironmentStatus) {
    }

    public $onInit(): void {
        this.trainingEnv = this.EnvironmentStatus.isTrainingEnv();
        const orgs: IUserInfoOrganisation[] = [];
        this.UserInfoService.getUserOrgsAndRoles()
            .then((userInfo: IUserInfoResponseData): void => {
                if (!userInfo) {
                    return;
                }
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
            }, (err: Error): void => {
                this.$log.warn("err", err);
                return null;
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
