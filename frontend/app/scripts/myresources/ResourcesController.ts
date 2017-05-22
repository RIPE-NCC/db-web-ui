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
    public selectedOrg: Organisation; // selection bound to ng-model in widget
    public loading: boolean; //true until resources are loaded to tabs
    public reason = "No resources found";
    public fail: boolean;

    private hasSponsoredResources = false;
    private isShowingSponsored = false;

    constructor(private $log: angular.ILogService,
                private $location: angular.ILocationService,
                private $scope: angular.IScope,
                private $state: IResourcesControllerState,
                private resourcesDataService: ResourcesDataService,
                private userInfoService: any) {

        this.isShowingSponsored = this.$state.params.sponsored && this.$state.params.sponsored.toString() === "true";

        $scope.$on("selected-lir-changed", () => {
            this.selectedOrg = this.userInfoService.getSelectedLir();
            this.refreshPage();
        });

        $scope.$on("lirs-loaded-event", () => {
            this.refreshPage();
        });

        this.refreshPage();
        this.goHome(this.$state.params.type);
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

    public refreshPage() {
        if (!this.selectedOrg) {
            this.selectedOrg = this.userInfoService.getSelectedLir();
        }
        this.fetchResourcesAndPopulatePage();
    }

    private fetchResourcesAndPopulatePage() {
        this.ipv4Resources = this.ipv6Resources = this.asnResources = [];
        if (!this.selectedOrg) {
            return;
        }
        this.loading = true;
        Promise.all([
            this.resourcesDataService.fetchIpv4Resources(this.selectedOrg.orgId),
            this.resourcesDataService.fetchIpv6Resources(this.selectedOrg.orgId),
            this.resourcesDataService.fetchAsnResources(this.selectedOrg.orgId),
            this.resourcesDataService.fetchSponsoredIpv4Resources(this.selectedOrg.orgId),
            this.resourcesDataService.fetchSponsoredIpv6Resources(this.selectedOrg.orgId),
            this.resourcesDataService.fetchSponsoredAsnResources(this.selectedOrg.orgId),
        ]).then( (responses: any[]) => {
            this.hasSponsoredResources = !(this.empty(responses[3]) && this.empty(responses[4]) && this.empty(responses[5]));
            if (this.hasSponsoredResources && this.isShowingSponsored) {
                this.ipv4Resources = responses[3].data.resources;
                this.ipv6Resources = responses[4].data.resources;
                this.asnResources = responses[5].data.resources;
            } else {
                this.ipv4Resources = responses[0].data.resources;
                this.ipv6Resources = responses[1].data.resources;
                this.asnResources  = responses[2].data.resources;
            }
            this.loading = false;
        }, reason => {
            this.fail = true;
            this.loading = false;
            this.reason = "There was problem reading resources please try again ";
            console.log(reason);
        });

    }

    private empty(response: any): boolean {
        if (response.data.resources && response.data.resources.length) {
            return false;
        }
        return true;
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
