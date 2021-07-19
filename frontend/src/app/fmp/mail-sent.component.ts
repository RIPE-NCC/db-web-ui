import {Component} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {AlertsService} from "../shared/alert/alerts.service";

@Component({
    selector: "mail-sent",
    templateUrl: "./mail-sent.component.html",
})
export class MailSentComponent {

    public email: string;

    constructor(private alertsService: AlertsService,
                public activatedRoute: ActivatedRoute) {}

    public ngOnInit() {
        this.email = this.activatedRoute.snapshot.paramMap.get("email");
        this.alertsService.setGlobalSuccess("Success!");
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
    }
}
