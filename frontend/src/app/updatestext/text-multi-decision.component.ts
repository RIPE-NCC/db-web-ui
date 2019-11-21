import {Component} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {PreferenceService} from "../updates/preference.service";
import {PropertiesService} from "../properties.service";

@Component({
    selector: "text-multi-decision",
    templateUrl: "./text-multi-decision.component.html",
})
export class TextMultiDecisionComponent {

    constructor(private router: Router,
                private modalService: NgbModal,
                public preferenceService: PreferenceService,
                public properties: PropertiesService) {
    }

    public ngOnInit() {
        if (!this.preferenceService.hasMadeSyncUpdatesDecision()) {
            console.info("TextMultiDecisionController: Force use to make decision:");
            // stay on page to force decision
            const modalRef = this.modalService.open(TextMultiDecisionComponent);
            modalRef.result.then((useNewSyncUpdates: any) => {
                if (useNewSyncUpdates) {
                    this.navigateToNew();
                } else {
                    this.navigateToOld();
                }
            }, () => {
                this.navigateToOld();
            });

        } else {
            console.info("TextMultiDecisionController: Decision made:");
            console.info("new-mode:" + this.preferenceService.isRichSyncupdatesMode());
            console.info("old-mode:" + this.preferenceService.isPoorSyncupdatesMode());

            // redirect to new or old
            if (this.preferenceService.isRichSyncupdatesMode()) {
                this.navigateToNew();
            } else {
                this.navigateToOld();
            }
        }
    }

    private navigateToNew() {
        this.preferenceService.setRichSyncupdatesMode();
        this.router.navigate(["textupdates/multi"]);
    }

    private navigateToOld() {
        this.preferenceService.setPoorSyncupdatesMode();
        this.router.navigate([this.properties.DATABASE_SYNCUPDATES_URL]);
    }
}
