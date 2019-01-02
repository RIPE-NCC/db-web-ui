class OrgDropDownController {
    public static $inject = ["$log", "$rootScope", "$scope", "UserInfoService", "EnvironmentStatus", "Properties"];

    public selectedOrg: IUserInfoOrganisation;
    public organisations: IUserInfoOrganisation[] = [];
    // Temporary until we need different application on Test, Training and RC environment
    public trainingEnv: boolean;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private UserInfoService: UserInfoService,
                private EnvironmentStatus: EnvironmentStatus,
                public Properties: IProperties) {
    }

    public $onInit(): void {
        this.trainingEnv = this.EnvironmentStatus.isTrainingEnv();
        const orgs: IUserInfoOrganisation[] = [];
        const members: IUserInfoOrganisation[] = [];
        this.UserInfoService.getUserOrgsAndRoles()
            .then((userInfo: IUserInfoResponseData): void => {
                if (!userInfo) {
                    return;
                }
                if (angular.isArray(userInfo.organisations)) {
                    for (const org of userInfo.organisations) {
                        orgs.push(org);
                    }
                    this.sortOrganisations(orgs);
                }
                if (angular.isArray(userInfo.members)) {
                    for (const org of userInfo.members) {
                        members.push(org);
                    }
                    this.sortOrganisations(members);
                }
                this.organisations = members.concat(orgs);
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

    private sortOrganisations(orgs: IUserInfoOrganisation[]): IUserInfoOrganisation[] {
        return orgs.sort((o1, o2) => {
            return o1.organisationName.localeCompare(o2.organisationName);
        });
    }
}

angular.module("dbWebApp")
    .component("orgDropDown", {
        controller: OrgDropDownController,
        templateUrl: "scripts/dropdown/org-drop-down.html",
    });
