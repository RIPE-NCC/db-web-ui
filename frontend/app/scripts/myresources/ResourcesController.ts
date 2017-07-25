import IHttpPromiseCallbackArg = angular.IHttpPromiseCallbackArg;

interface IResourcesControllerState extends ng.ui.IStateService {
    params: {
        type: string;
        sponsored: boolean;
    };
}

class ResourcesController {
    public static $inject = ["$log", "$location", "$scope", "$state", "$q", "ResourcesDataService", "UserInfoService"];
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
    private lastTab = "";

    constructor(private $log: angular.ILogService,
                private $location: angular.ILocationService,
                private $scope: angular.IScope,
                private $state: IResourcesControllerState,
                private $q: ng.IQService,
                private resourcesDataService: ResourcesDataService,
                private UserInfoService: UserInfoService) {

        this.isShowingSponsored = typeof this.$state.params.sponsored === "string" ?
            this.$state.params.sponsored === "true" : this.$state.params.sponsored;

        this.refreshPage();
        this.lastTab = this.$state.params.type;
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
        $scope.$on("selected-org-changed", (event: IAngularEvent, selected: IUserInfoOrganisation) => {
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
        this.loading = true;
        this.$q.all([
            this.resourcesDataService.fetchIpv4Resources(this.selectedOrg.orgObjectId),
            this.resourcesDataService.fetchIpv6Resources(this.selectedOrg.orgObjectId),
            this.resourcesDataService.fetchAsnResources(this.selectedOrg.orgObjectId),
            this.resourcesDataService.fetchSponsoredIpv4Resources(this.selectedOrg.orgObjectId),
            this.resourcesDataService.fetchSponsoredIpv6Resources(this.selectedOrg.orgObjectId),
            this.resourcesDataService.fetchSponsoredAsnResources(this.selectedOrg.orgObjectId),
        ]).then((responses: any[]) => {
            this.hasSponsoredResources =
                !(this.empty(responses[3]) && this.empty(responses[4]) && this.empty(responses[5]));
            if (this.hasSponsoredResources && this.isShowingSponsored) {
                this.ipv4Resources = responses[3].data.resources;
                this.ipv6Resources = responses[4].data.resources;
                this.asnResources = responses[5].data.resources;
            } else {
                this.isShowingSponsored = false;
                this.ipv4Resources = responses[0].data.resources;
                this.ipv6Resources = responses[1].data.resources;
                this.asnResources = responses[2].data.resources;
            }
            this.loading = false;
        }, () => {
            this.fail = true;
            this.loading = false;
            this.reason = "There was problem reading resources please try again";
        });

    }

    private empty(response: any): boolean {
        return !(response.data.resources && response.data.resources.length);
    }
}

angular
    .module("dbWebApp")
    .controller("ResourcesController", ResourcesController);
