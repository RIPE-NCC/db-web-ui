import IAngularEvent = angular.IAngularEvent;

class LeftMenuController {
    public static $inject = ["$log", "$rootScope", "$cookies"];
    public searchExpanded: boolean;
    public webUpdatesExpanded: boolean;
    public myResourcesChosen: boolean;
    public passwordsExpanded: boolean;
    public activeUrl: string;
    // has an id just of digit in case of LIR, otherwise contain letters too
    public activeMembershipId: string;
    public cookies: angular.cookies.ICookiesService;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $cookies: angular.cookies.ICookiesService) {

        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: {name: string, url: string}) => {
            this.activeUrl = toState.url;
            this.clearStates();
            if (toState.name.indexOf("webupdates.myresources") === 0) {
                this.myResourcesChosen = true;
            } else if (toState.name.indexOf("webupdates") === 0 || toState.name.indexOf("textupdates") === 0) {
                this.webUpdatesExpanded = true;
            } else if (toState.name.indexOf("fmp") === 0) {
                this.passwordsExpanded = true;
            }
        });
        this.cookies = $cookies;
    }

    public isLirUser()  {
        // TODO: move this behind a service!
        return /^\d+$/.test(this.cookies.get("activeMembershipId"));
    }

    private clearStates() {
        this.webUpdatesExpanded = false;
        this.myResourcesChosen = false;
        this.passwordsExpanded = false;
    }
}

angular.module("dbWebApp").controller("LeftMenuController", LeftMenuController);
