interface IResourcesControllerState extends ng.ui.IStateService {
    params: {
        type: string;
        sponsored: boolean;
    };
}

class ResourcesController {
    public static $inject = [
        "$location",
        "$log",
        "$scope",
        "$state",
        "$timeout",
        "$q",
        "ResourcesDataService",
        "UserInfoService",
    ];
    public ipv4Resources: IPv4ResourceDetails[] = [];
    public ipv6Resources: IPv6ResourceDetails[] = [];
    public asnResources: AsnResourceDetails[] = [];
    public typeIndex = 0;
    public selectedOrg: IUserInfoOrganisation; // selection bound to ng-model in widget
    public loading: boolean; // true until resources are loaded to tabs
    public reason = "No resources found";
    public fail: boolean;

    private hasSponsoredResources = false;
    private isShowingSponsored = false;
    private lastTab: string;

    constructor(private $location: angular.ILocationService,
                private $log: angular.ILogService,
                private $scope: angular.IScope,
                private $state: IResourcesControllerState,
                private $timeout: ng.ITimeoutService,
                private $q: ng.IQService,
                private ResourcesDataService: IResourcesDataService,
                private UserInfoService: UserInfoService) {

        this.isShowingSponsored = typeof this.$state.params.sponsored === "string" ?
            this.$state.params.sponsored === "true" : this.$state.params.sponsored;

        this.refreshPage();
        this.lastTab = this.$state.params.type || "inetnum";
        switch (this.$state.params.type) {
            case "inet6num":
                this.typeIndex = 1;
                break;
            case "aut-num":
                this.typeIndex = 2;
                break;
            default:
                this.typeIndex = 0;
        }

        // Callbacks
        $scope.$on("selected-org-changed", (event: ng.IAngularEvent, selected: IUserInfoOrganisation) => {
            this.selectedOrg = selected;
            this.refreshPage();
        });

    }

    public tabClicked(tabName: string) {
        this.lastTab = tabName;
        this.$location.search({type: tabName, sponsored: this.isShowingSponsored});
    }

    public sponsoredResourcesClicked() {
        this.isShowingSponsored = !this.isShowingSponsored;
        this.$location.search({type: this.lastTab, sponsored: this.isShowingSponsored});
    }

    public refreshPage() {
        if (!this.selectedOrg) {
            this.UserInfoService.getSelectedOrganisation().then((org) => {
                this.selectedOrg = org;
                this.fetchResourcesAndPopulatePage();
            });
        } else {
            this.fetchResourcesAndPopulatePage();
        }
    }

    private fetchResourcesAndPopulatePage() {
        this.ipv4Resources = this.ipv6Resources = this.asnResources = [];
        if (!this.selectedOrg) {
            return;
        }

        const promise = this.$timeout(() => {
            this.loading = true;
        }, 200);

        this.ResourcesDataService
            .fetchResources(this.selectedOrg.orgObjectId, this.lastTab, this.isShowingSponsored)
            .then((response: ng.IHttpPromiseCallbackArg<IResourceOverviewResponseModel>) => {
                this.$timeout.cancel(promise);
                this.loading = false;
                this.hasSponsoredResources = response.data.stats && (
                    response.data.stats.numSponsoredInetnums +
                    response.data.stats.numSponsoredInet6nums +
                    response.data.stats.numSponsoredAutnums) > 0;
                switch (this.lastTab) {
                    case "inetnum":
                        this.ipv4Resources = response.data.resources;
                        break;
                    case "inet6num":
                        this.ipv6Resources = response.data.resources;
                        break;
                    case "aut-num":
                        this.asnResources = response.data.resources;
                        break;
                    default:
                        this.$log.error("Error. Cannot understand resources response");
                }
            }, () => {
                this.fail = true;
                this.$timeout.cancel(promise);
                this.loading = false;
                this.reason = "There was problem reading resources please try again";
            });
    }

}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
