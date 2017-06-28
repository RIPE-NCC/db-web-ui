import IAngularEvent = angular.IAngularEvent;

class LeftMenuController {
    public static $inject = ["$log", "$rootScope", "$scope", "$state"];

    public webUpdatesExpanded: boolean;
    public activeUrl: string;

    public shouldDisplayMyResources: boolean;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService,
                private $scope: angular.IScope,
                private $state: ng.ui.IStateService) {

        this.shouldDisplayMyResources = false;
        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: any) => {
            this.activeUrl = toState.url;
            this.webUpdatesExpanded =
                (toState.name.indexOf("myresources") === 0 ||
                toState.name.indexOf("webupdates") === 0 ||
                toState.name.indexOf("textupdates") === 0);
        });
        $scope.$on("lirs-loaded-event", (event: IAngularEvent, lirs: IOrganisationModel[]) => {
            if (lirs && lirs.length > 0) {
                this.shouldDisplayMyResources = true;
            }
        });
    }

}

angular.module("dbWebApp").controller("LeftMenuController", LeftMenuController);
