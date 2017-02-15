import IAngularEvent = angular.IAngularEvent;
class LeftMenuController {
    public static $inject = ["$log", "$rootScope"];
    public searchExpanded: boolean;
    public webUpdatesExpanded: boolean;
    public passwordsExpanded: boolean;
    public activeUrl: string;

    constructor(private $log: angular.ILogService,
                private $rootScope: angular.IRootScopeService) {

        $rootScope.$on("$stateChangeSuccess", (event: IAngularEvent, toState: {name: string, url: string}) => {
            this.activeUrl = toState.url;
            if (toState.name.indexOf("webupdates.myresources") === 0) {
                this.searchExpanded = true;
            } else if (toState.name.indexOf("webupdates") === 0 || toState.name.indexOf("textupdates") === 0) {
                this.webUpdatesExpanded = true;
            } else if (toState.name.indexOf("fmp") === 0) {
                this.passwordsExpanded = true;
            }
        });
    }
}

angular.module("dbWebApp").controller("LeftMenuController", LeftMenuController);
