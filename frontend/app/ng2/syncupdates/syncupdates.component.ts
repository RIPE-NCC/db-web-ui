import {Component, Inject} from "@angular/core";
import {Labels} from "../label.constants";
import {SyncupdatesService} from "./syncupdates.service";

@Component({
    selector: "syncupdates",
    templateUrl: "./syncupdates.component.html",
})
export class SyncupdatesComponent {

    public rpslObject: string;
    public updateResponse: string;
    public errorMessages: string;

    public isUpdating: boolean = false;
    public msgRipeTAndCSubmitlinkText: string;

    constructor(
        // TODO angular.ILogService
        @Inject("$log") private $log: any,
        // TODO ng.ui.IStateService
        @Inject("$state") private $state: any,
        // TODO change any into PreferenceService
        @Inject("PreferenceService") private PreferenceService: any,
        private syncupdatesService: SyncupdatesService,
        // TODO ng.IAnchorScrollService
        @Inject("$anchorScroll") private $anchorScroll: any,
        @Inject("$location") private $location: angular.ILocationService) {
        this.msgRipeTAndCSubmitlinkText = Labels.MSG_RIPE_T_AND_C_SUBMITLINK_TEXT;
    }

    public update() {
        if (!this.rpslObject) {
            return;
        }
        this.isUpdating = true;
        this.syncupdatesService.update(this.rpslObject)
            .subscribe((response: any) => {
                        this.updateResponse = response;
                        this.$location.hash("anchorScroll");
                        this.$anchorScroll();
                    console.log("reject", response);
                    },
                    (error: any) => {
                        this.errorMessages = error;
                        console.log("reject", error);
                    },
                    () => this.isUpdating = false
            );
    }

    public useBetaSyncupdate() {
        this.PreferenceService.setRichSyncupdatesMode();
        this.$state.transitionTo("textupdates.multi");
    }
}
