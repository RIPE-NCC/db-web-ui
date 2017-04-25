import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

interface IResourcesControllerState extends ng.ui.IStateService {
    params: {
        type: string;
        sponsored: boolean;
    };
}

class ResourcesController {
    public static $inject = ["$log", "$location", "$scope", "$state", "ResourcesDataService", "UserInfoService"];
    public ipv4Resources: IPv4ResourceDetails[] = [];
    public ipv6Resources: IPv6ResourceDetails[] = [];
    public asnResources: AsnResourceDetails[] = [];
    public typeIndex = 0;
    public organisations: Organisation[]; // fills dropdown
    public selectedOrg: Organisation; // selection bound to ng-model in widget

    private hasSponsoredResources = false;
    private isShowingSponsored = false;

    constructor(private $log: angular.ILogService,
                private $location: angular.ILocationService,
                private $scope: angular.IScope,
                private $state: IResourcesControllerState,
                private resourcesDataService: ResourcesDataService,
                private userInfoService: any) {

        this.isShowingSponsored = this.$state.params.sponsored;

        $scope.$on("lirs-loaded-event", () => {
            this.refreshPage();
        });
        this.refreshPage();
        this.goHome(this.$state.params.type);
    }

    public organisationSelected(): void {
        this.userInfoService.setSelectedLir(this.selectedOrg);
        this.refreshPage();
    }

    public sponsoredResourcesClicked() {
        this.isShowingSponsored = !this.isShowingSponsored;
        this.fetchResourcesAndPopulatePage();
    }

    public goHome(objectType: string) {
        switch (objectType) {
            case "inet6num":
                this.typeIndex = 1;
                break;
            case "aut-num":
                this.typeIndex = 2;
                break;
            default:
                this.typeIndex = 0;
        }
    }

    private refreshPage() {
        if (!this.organisations) {
            this.organisations = this.userInfoService.getLirs();
        }

        if (!this.selectedOrg) {
            this.selectedOrg = this.userInfoService.getSelectedLir();
        }
        // this.isShowingSponsored = false;
        this.fetchResourcesAndPopulatePage();
        this.checkIfSponsor();
    }

    private fetchResourcesAndPopulatePage() {
        this.ipv4Resources = this.ipv6Resources = this.asnResources = [];
        if (!this.selectedOrg) {
            return;
        }
        const v4Res = this.resourcesDataService[this.isShowingSponsored ?
            "fetchSponsoredIpv4Resources" : "fetchIpv4Resources"](this.selectedOrg.orgId);
        const v6Res = this.resourcesDataService[this.isShowingSponsored ?
            "fetchSponsoredIpv6Resources" : "fetchIpv6Resources"](this.selectedOrg.orgId);
        const asnRes = this.resourcesDataService[this.isShowingSponsored ?
            "fetchSponsoredAsnResources" : "fetchAsnResources"](this.selectedOrg.orgId);

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
            if (response.data.resources && response.data.resources.length) {
                this.hasSponsoredResources = true;
            }
        });
        v6Res.then((response: IHttpPromiseCallbackArg<IPv6ResourcesResponse>) => {
            if (response.data.resources && response.data.resources.length) {
                this.hasSponsoredResources = true;
            }
        });
        asnRes.then((response: IHttpPromiseCallbackArg<AsnResourcesResponse>) => {
            if (response.data.resources && response.data.resources.length) {
                this.hasSponsoredResources = true;
            }
        });
        if (!this.hasSponsoredResources && this.isShowingSponsored) {
          this.isShowingSponsored = false;
          this.refreshPage();
        }
    }

}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
