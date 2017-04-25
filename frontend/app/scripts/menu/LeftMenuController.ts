import IAngularEvent = angular.IAngularEvent;

class LeftMenuController {
    public static $inject = ["$log", "$rootScope", "$scope", "$state"];

    public webUpdatesExpanded: boolean;
    public myResourcesChosen: boolean;
    public activeUrl: string;

    public shouldDisplayMyResources: boolean;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private $state: ng.ui.IStateService) {

        this.shouldDisplayMyResources = false;
        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: any) => {
            this.activeUrl = toState.url;
            this.webUpdatesExpanded = this.myResourcesChosen = false;
            if (toState.name.startsWith("webupdates.myresources")) {
                this.myResourcesChosen = true;
            }
            if (toState.name.startsWith("webupdates") || toState.name.startsWith("textupdates")) {
                this.webUpdatesExpanded = true;
            }
        });
        $scope.$on("lirs-loaded-event", (event: IAngularEvent, lirs: Organisation[]) => {
            if (lirs && lirs.length > 0) {
                this.shouldDisplayMyResources = true;
            }
        });
    }

}

angular.module("dbWebApp").controller("LeftMenuController", LeftMenuController);
