class OrgDropDownController {
    public static $inject = ["$log", "$rootScope", "$scope", "UserInfoService"];

    public selectedOrg: Organisation;
    public organisations: Organisation[];

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private userInfoService: any) {
        $scope.$on("lirs-loaded-event", () => {
            this.$onInit();
        });
    }

    public $onInit(): void {
        this.selectedOrg = this.userInfoService.getSelectedLir();
        this.organisations = this.userInfoService.getLirs();
    }

    public organisationSelected(): void {
        this.userInfoService.setSelectedLir(this.selectedOrg);
        this.$rootScope.$broadcast("selected-lir-changed", this.selectedOrg);
    }

    public hasLirs(): boolean {
        return this.organisations && this.organisations.length > 0;
    }
}

angular
    .module("dbWebApp")
    .controller("OrgDropDownController", OrgDropDownController);
