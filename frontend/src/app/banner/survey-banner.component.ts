import {Component} from "@angular/core";
import {CookieService} from "ngx-cookie-service";
import {EnvironmentStatusService} from "../shared/environment-status.service";

@Component({
    selector: "survey-banner",
    template: `<div *ngIf="!closedSurvey" class="alert alert-info alert-dismissible fade show" role="alert">
        Please take the RIPE Database Usage Survey, so we can find out how the RIPE Community uses the RIPE database. Thanks! <a href="https://www.surveymonkey.com/r/PC9HTYP" target="_blank" class="alert-link">https://www.surveymonkey.com/r/PC9HTYP</a>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close" (click)="closeAlert()">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`,
})
export class SurveyBannerComponent {

    public closedSurvey: boolean;

    constructor(private cookies: CookieService) {}

    public ngOnInit() {
        // don't show survey in case it was closed or on training environment
        this.closedSurvey = this.cookies.get("survey") === "closed" || EnvironmentStatusService.isTrainingEnv();
    }

    public closeAlert() {
        this.cookies.set("survey", "closed");
    }
}
