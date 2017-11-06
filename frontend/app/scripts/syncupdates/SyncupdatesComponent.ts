class SyncupdatesController {

    public static $inject = [
        "$log",
        "$state",
        "PreferenceService",
        "SyncupdatesService",
        "$anchorScroll",
        "$location",
    ];

    public rpslObject: string;
    public updateResponse: string;
    public errorMessages: string;

    constructor(private $log: angular.ILogService,
                private $state: ng.ui.IStateService,
                private PreferenceService: any,
                private syncupdatesService: SyncupdatesService,
                private $anchorScroll: ng.IAnchorScrollService,
                private $location: angular.ILocationService) {
    }

    public update() {
        if (!this.rpslObject) {
            return;
        }

        this.syncupdatesService.update(this.rpslObject)
            .then(
                (response) => {
                    this.updateResponse = response.data;
                    this.$location.hash("anchorScroll");
                    this.$anchorScroll();
                    },
                (error) => this.errorMessages = error)
            .catch((reject: any) => {
                this.$log.info("reject", reject);
            });
    }

    public useBetaSyncupdate() {
        this.PreferenceService.setRichSyncupdatesMode();
        this.$state.transitionTo("textupdates.multi");
    }
}

angular.module("dbWebApp").component("syncupdates", {
    controller: SyncupdatesController,
    templateUrl: "scripts/syncupdates/syncupdates.html",
});
