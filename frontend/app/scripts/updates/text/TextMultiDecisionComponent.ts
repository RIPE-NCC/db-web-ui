class TextMultiDecisionController {

    public static $inject = ["$state", "$log", "$window", "ModalService", "PreferenceService", "Properties"];

    constructor(public $state: ng.ui.IStateService,
                public $log: angular.ILogService,
                public $window: any,
                ModalService: ModalService,
                public PreferenceService: PreferenceService,
                public properties: IProperties) {

        if (!this.PreferenceService.hasMadeSyncUpdatesDecision()) {
            this.$log.info("TextMultiDecisionController: Force use to make decision:");
            // stay on page to force decision
            ModalService.openChoosePoorRichSyncupdates()
                .then((useNewSyncUpdates: any) => {
                    if (useNewSyncUpdates) {
                        this.navigateToNew();
                    } else {
                        this.navigateToOld();
                    }
                }, () => {
                    this.navigateToOld();
                },
            );

        } else {
            this.$log.info("TextMultiDecisionController: Decision made:");
            this.$log.info("new-mode:" + this.PreferenceService.isRichSyncupdatesMode());
            this.$log.info("old-mode:" + this.PreferenceService.isPoorSyncupdatesMode());

            // redirect to new or old
            if (this.PreferenceService.isRichSyncupdatesMode()) {
                this.navigateToNew();
            } else {
                this.navigateToOld();
            }
        }
    }

    private navigateToNew() {
        this.PreferenceService.setRichSyncupdatesMode();
        this.$window.location.href = "#/textupdates/multi";
    }

    private navigateToOld() {
        this.PreferenceService.setPoorSyncupdatesMode();
        this.$window.location.href = this.properties.DATABASE_SYNCUPDATES_URL;
    }
}

angular.module("textUpdates")
    .component("textMultiDecision", {
        controller: TextMultiDecisionController,
        templateUrl: "scripts/updates/text/multiDecision.html",
    });
