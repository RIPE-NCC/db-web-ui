import {Component, OnInit} from "@angular/core";
import {PropertiesService} from "../properties.service";
import {EnvironmentStatusService} from "../shared/environment-status.service";

@Component({
    selector: "web-app-version",
    template: `
        <div class="db-version-footer text-muted">
            <span *ngIf="trainingEnv">RIPE Database Web Application: {{properties.DB_WEB_UI_BUILD_TIME}} </span>
        </div>`
})
export class WebAppVersionComponent implements OnInit {

    public trainingEnv: boolean;

    constructor(public properties: PropertiesService) {}

    ngOnInit() {
        this.trainingEnv = EnvironmentStatusService.isTrainingEnv();
    }
}
