import IAngularEvent = angular.IAngularEvent;

class LeftMenuController {
    public static $inject = ["$log", "$rootScope", "OrgDropDownStateService"];
    // public searchExpanded: boolean;
    public webUpdatesExpanded: boolean;
    public myResourcesChosen: boolean;
    public passwordsExpanded: boolean;
    public activeUrl: string;
    // has an id just of digit in case of LIR, otherwise contain letters too
    public activeMembershipId: string;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private orgDropDownStateService: OrgDropDownStateService) {

        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: any) => {
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
    }

    public isLirUser()  {
        const org = this.orgDropDownStateService.getSelectedOrg();
        return org ? /^\d+$/.test(org.memberId.toString()) : false;
    }

    private clearStates() {
        this.webUpdatesExpanded = false;
        this.myResourcesChosen = false;
        this.passwordsExpanded = false;
    }
}

angular.module("dbWebApp").controller("LeftMenuController", LeftMenuController);
