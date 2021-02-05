import {Component} from "@angular/core";

@Component({
    selector: "questionnaire-banner",
    templateUrl: "./questionnaire-banner.component.html",
})
export class QuestionnaireBannerComponent {

    public closed: boolean;

    constructor() {}

    public ngOnInit() {
        this.closed = localStorage.getItem("DBTF-banner")  === "closed";
    }

    public closeAlert() {
        localStorage.setItem("DBTF-banner", "closed");
    }
}
