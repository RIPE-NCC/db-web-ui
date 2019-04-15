interface IResourcesControllerState extends ng.ui.IStateService {
    params: {
        type: string;
        sponsored: boolean;
        ipanalyserRedirect: boolean;
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
    public ipv4Resources: IIPv4ResourceDetails[] = [];
    public ipv6Resources: IIPv6ResourceDetails[] = [];
    public asnResources: IAsnResourceDetails[] = [];
    public typeIndex = 0;
    public selectedOrg: IUserInfoOrganisation; // selection bound to ng-model in widget
    public loading: boolean = false; // true until resources are loaded to tabs
    public reason = "No resources found";
    public fail: boolean;
    public showIpAnalyserRedirectBanner: boolean = true;
    public isRedirectedFromIpAnalyser: boolean = false;
    public lastTab: string;

    private isShowingSponsored: boolean = false;
    private activeSponsoredTab = 0;
    private showAlerts: boolean = true;

    constructor(private $location: angular.ILocationService,
                private $log: angular.ILogService,
                private $scope: angular.IScope,
                private $state: IResourcesControllerState,
                private $timeout: ng.ITimeoutService,
                private $q: ng.IQService,
                private resourcesDataService: IResourcesDataService,
                private userInfoService: UserInfoService) {
    }

    public $onInit() {
        this.isShowingSponsored = typeof this.$state.params.sponsored === "string" ?
            this.$state.params.sponsored === "true" : this.$state.params.sponsored;
        this.activeSponsoredTab = this.isShowingSponsored ? 1 : 0;

        this.showTheIpAnalyserBanner(this.$state.params.ipanalyserRedirect);

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
        this.showAlerts = !this.isShowingSponsored && this.lastTab === "inetnum";

        // Callbacks
        this.$scope.$on("selected-org-changed", (event: ng.IAngularEvent, selected: IUserInfoOrganisation) => {
            this.selectedOrg = selected;
            // go back to the start "My Resources" page
            this.refreshPage();
        });
    }

    public tabClicked(tabName: string) {
        if (this.lastTab !== tabName) {
            this.lastTab = tabName;
            this.$location.search({type: tabName, sponsored: this.isShowingSponsored, ipanalyserRedirect: "" + this.isRedirectedFromIpAnalyser });
        }
    }

    public sponsoredResourcesTabClicked() {
        if (!this.isShowingSponsored) {
            this.isShowingSponsored = true;
            this.$location.search({type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: "" + this.isRedirectedFromIpAnalyser });
        }
        this.$scope.$broadcast("$stateChangeSuccess", this.$state);
    }

    public resourcesTabClicked() {
        if (this.isShowingSponsored) {
            this.isShowingSponsored = false;
            this.$location.search({type: this.lastTab, sponsored: this.isShowingSponsored, ipanalyserRedirect: "" + this.isRedirectedFromIpAnalyser });
        }
        this.$scope.$broadcast("$stateChangeSuccess", this.$state);
    }

    public refreshPage() {
        if (!this.selectedOrg) {
            this.userInfoService.getSelectedOrganisation().then((org) => {
                this.selectedOrg = org;
                this.fetchResourcesAndPopulatePage();
            });
        } else {
            if (this.selectedOrg.roles.indexOf("guest") > -1) {
                this.$state.transitionTo("query");
            } else {
                this.fetchResourcesAndPopulatePage();
            }
        }
    }

    public isMemberOrg(): boolean {
        return this.isUserInfoRegistration(this.selectedOrg);
    }

    private isUserInfoRegistration(arg: any): arg is IUserInfoRegistration {
        return !!arg && !!arg.membershipId;
    }

    private showTheIpAnalyserBanner(ipanalyserRedirect: boolean) {
      const redirect: boolean = typeof this.$state.params.ipanalyserRedirect === "string" ?
          this.$state.params.ipanalyserRedirect === "true" :
          this.$state.params.ipanalyserRedirect;

      this.isRedirectedFromIpAnalyser = redirect;

      // this is to prevent the annoying banner every time (we probably
      // want to remove this logic and show the banner all the time)
      const item = "shown";
      if (redirect) {
        const shown = localStorage.getItem(item);
        if (shown === item) {
          this.showIpAnalyserRedirectBanner = false;
        } else {
          this.showIpAnalyserRedirectBanner = redirect;
          localStorage.setItem(item, item);
        }
      } else {
        this.showIpAnalyserRedirectBanner = false;
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

        this.resourcesDataService
            .fetchResources(this.selectedOrg.orgObjectId, this.lastTab, this.isShowingSponsored)
            .then((response: ng.IHttpPromiseCallbackArg<IResourceOverviewResponseModel>) => {
                this.$timeout.cancel(promise);
                this.loading = false;
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
            }, (error: any) => {
                // if it's not authentication error
                if (error.status !== 401 && error.status !== 403) {
                    this.fail = true;
                    this.$timeout.cancel(promise);
                    this.loading = false;
                    this.reason = "There was problem reading resources please try again";
                }
            });
    }

}

angular
    .module("dbWebApp")
    .component("resources", {
        controller: ResourcesController,
        templateUrl: "./resources.html",
    });
