class ForceDeleteSelectController {

    public static $inject = ["$stateParams", "$state", "Properties", "$log", "AlertService"];

    public objectTypes: string[] = ["inetnum", "inet6num", "route", "route6", "domain"];
    public selected: any;

    constructor(public $stateParams: ng.ui.IStateParamsService,
                public $state: ng.ui.IStateService,
                public Properties: IProperties,
                public $log: angular.ILogService,
                public AlertService: AlertService) {

        this.AlertService.clearErrors();
        this.selected = {
            name: undefined,
            objectType: this.objectTypes[0],
            source: Properties.SOURCE,
        };
    }

    public navigateToForceDelete() {
        return this.$state.transitionTo(STATE.FORCE_DELETE, {
            name: this.selected.name,
            objectType: this.selected.objectType,
            source: this.selected.source,
        });
    }

    public isFormValid(): boolean {
        return this.selected.name !== undefined && this.selected.name !== "";
    }
}

angular.module("webUpdates")
    .component("forceDeleteSelect", {
        controller: ForceDeleteSelectController,
        templateUrl: "scripts/updates/web/forceDeleteSelect.html",
    });
