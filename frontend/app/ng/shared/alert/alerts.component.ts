import {Component} from "@angular/core";
import {AlertsService} from "./alerts.service";

@Component({
    selector: "alerts",
    templateUrl: "./alerts.component.html",
})
export class AlertsComponent {

    constructor(public alertsService: AlertsService) {}

    public getErrors() {
        return this.alertsService.errors;
    }

    public hasErrors() {
        return this.alertsService.hasErrors();
    }
}
