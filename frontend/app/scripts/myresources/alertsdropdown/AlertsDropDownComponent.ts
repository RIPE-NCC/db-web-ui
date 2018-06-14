class AlertsDropDownController {

    public static $inject = [
        "Properties",
        "UserInfoService",
        "ResourcesDataService",
        "IpAddressService",
        "$state",
        "$scope",
    ];

    public overlaps: IIpv4OverlappingInetnumsAnalysis[] = [];
    public syntaxErrors: string[] = [];
    public hasAlerts: boolean = false;
    public hasAllocations: boolean = false;

    public showDetail(resource: string): void {
        this.$state.go("myresourcesdetail", {
            objectName: resource,
            objectType: "inetnum",
            sponsored: false,
        });
    }

    constructor(private properties: IProperties, private userInfoService: UserInfoService, private resourcesDataService: ResourcesDataService, private ipAddressService: IpAddressService, private $state: ng.ui.IStateService, private $scope: angular.IScope) {
        userInfoService.getSelectedOrganisation().then((org: IUserInfoOrganisation) => {
            this.load(resourcesDataService, org);
        });
        $scope.$on("selected-org-changed", (event: ng.IAngularEvent, org: IUserInfoOrganisation) => {
            this.load(resourcesDataService, org);
        });
    }

    private load(resourcesDataService: ResourcesDataService, org: IUserInfoOrganisation): void {

        resourcesDataService.fetchIpv4Analysis(org.orgObjectId).then((analysisResponse: ng.IHttpResponse<IIpv4Analysis>) => {
            this.overlaps = [];
            this.syntaxErrors = [];
            this.hasAlerts = false;
            this.hasAllocations = false;

            const analysis: IIpv4Analysis = analysisResponse.data;

            this.hasAllocations = analysis.allocations.length > 0;
            analysis
                .allocations
                .forEach((allocation: IIpv4AllocationAnalysis, index: number, allocations: IIpv4AllocationAnalysis[]) => {
                    if (allocation.violations.overlappingInetnums) {
                        this.overlaps = allocation.violations.overlappingInetnums.concat(this.overlaps);
                    }
                });

            analysis
                .allocations
                .forEach((allocation: IIpv4AllocationAnalysis, index: number, allocations: IIpv4AllocationAnalysis[]) => {
                    if (allocation.violations.inetnumSyntaxErrors) {
                        this.syntaxErrors = allocation.violations.inetnumSyntaxErrors.concat(this.syntaxErrors);
                    }
                });
            this.syntaxErrors = [].concat.apply([], this.syntaxErrors);

            this.hasAlerts = this.syntaxErrors.length > 0 || this.overlaps.length > 0;
        });
    }

    public getRange(inetnum: string): string {
        return this.ipAddressService.fromSlashToRange(inetnum);
    }
}

angular.module("dbWebApp").component("alertsDropDown", {
    controller: AlertsDropDownController,
    templateUrl: "scripts/myresources/alertsdropdown/alerts-drop-down.html",
});

