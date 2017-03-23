import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

class ResourcesController {
    public static $inject = ["$log", "$scope", "MyResourcesDataService", "OrgDropDownStateService"];
    public ipv4Resources: IPv4ResourceDetails[] = [];
    public ipv6Resources: IPv6ResourceDetails[] = [];
    public asnResources: AsnResourceDetails[] = [];
    private selectedOrg: Organisation;
    private hasSponsoredResources = false;
    private isShowingSponsored = false;

    constructor(private $log: angular.ILogService,
                private $scope: angular.IScope,
                private resourcesDataService: MyResourcesDataService,
                private dropdownService: OrgDropDownStateService) {
        $scope.$on("organisation-changed-event", (event: IAngularEvent, selectedOrg: Organisation) => {
            this.refreshPage(selectedOrg);
        });
        this.dropdownService.getSelectedOrg().then((org: Organisation) => {
            if (org) {
                this.refreshPage(org);
            }
        });
    }

    public sponsoredResourcesClicked() {
        this.isShowingSponsored = !this.isShowingSponsored;
        this.fetchResourcesAndPopulatePage();
    }

    private refreshPage(org: Organisation) {
        this.selectedOrg = org;
        this.isShowingSponsored = false;
        this.fetchResourcesAndPopulatePage();
        this.checkIfSponsor();
    }

    private fetchResourcesAndPopulatePage() {
        this.ipv4Resources = this.ipv6Resources = this.asnResources = [];
        if (!this.selectedOrg) {
            return;
        }
        const v4Res = this.resourcesDataService
            [this.isShowingSponsored ? "fetchSponsoredIpv4Resources" : "fetchIpv4Resources"](this.selectedOrg.orgId);
        const v6Res = this.resourcesDataService
            [this.isShowingSponsored ? "fetchSponsoredIpv6Resources" : "fetchIpv6Resources"](this.selectedOrg.orgId);
        const asnRes = this.resourcesDataService
            [this.isShowingSponsored ? "fetchSponsoredAsnResources" : "fetchAsnResources"](this.selectedOrg.orgId);

        v4Res.then((response: IHttpPromiseCallbackArg<IPv4ResourcesResponse>) => {
            this.ipv4Resources = response.data.resources;
        });
        v6Res.then((response: IHttpPromiseCallbackArg<IPv6ResourcesResponse>) => {
            this.ipv6Resources = response.data.resources;
        });
        asnRes.then((response: IHttpPromiseCallbackArg<AsnResourcesResponse>) => {
            this.asnResources = response.data.resources;
        });
    }

    private checkIfSponsor() {
        this.hasSponsoredResources = false;
        if (!this.selectedOrg) {
            return;
        }
        const v4Res = this.resourcesDataService.fetchSponsoredIpv4Resources(this.selectedOrg.orgId);
        const v6Res = this.resourcesDataService.fetchSponsoredIpv6Resources(this.selectedOrg.orgId);
        const asnRes = this.resourcesDataService.fetchSponsoredAsnResources(this.selectedOrg.orgId);
        v4Res.then((response: IHttpPromiseCallbackArg<IPv4ResourcesResponse>) => {
            if (response.data.resources) {
                this.hasSponsoredResources = true;
            }
        });
        v6Res.then((response: IHttpPromiseCallbackArg<IPv6ResourcesResponse>) => {
            if (response.data.resources) {
                this.hasSponsoredResources = true;
            }
        });
        asnRes.then((response: IHttpPromiseCallbackArg<AsnResourcesResponse>) => {
            if (response.data.resources) {
                this.hasSponsoredResources = true;
            }
        });
    }

}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
