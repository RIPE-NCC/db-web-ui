import IAngularEvent = angular.IAngularEvent;

class LeftMenuController {
    public static $inject = ["$log", "$rootScope", "$scope", "$state"];
    // public searchExpanded: boolean;
    public webUpdatesExpanded: boolean;
    public myResourcesChosen: boolean;
    public passwordsExpanded: boolean;
    public activeUrl: string;
    // has an id just of digit in case of LIR, otherwise contain letters too
    public isLirSelected: boolean;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private $state: ng.ui.IStateService) {

        this.isLirSelected = false;
        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: any) => {
            this.activeUrl = toState.url;
            this.webUpdatesExpanded = this.myResourcesChosen = this.passwordsExpanded = false;
            if (toState.name.startsWith("webupdates.myresources")) {
                this.myResourcesChosen = true;
            } else if (toState.name.startsWith("webupdates") || toState.name.startsWith("textupdates")) {
                this.webUpdatesExpanded = true;
            } else if (toState.name.startsWith("fmp")) {
                this.passwordsExpanded = true;
            }
        });
        $scope.$on("organisation-changed-event", (event: IAngularEvent, org: Organisation) => {
            this.isLirSelected = org ? /^\d+$/.test(org.memberId.toString()) : false;
        });
    }

}

angular.module("dbWebApp").controller("LeftMenuController", LeftMenuController);
