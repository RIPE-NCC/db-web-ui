import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {AlertsService} from "../shared/alert/alerts.service";

@Component({
    selector: "sso-added",
    templateUrl: "./sso-added.component.html",
})
export class SsoAddedComponent implements OnInit, OnDestroy {

    public mntnerKey: string;
    public user: any;

    constructor(private activatedRoute: ActivatedRoute,
                private alertsService: AlertsService) {}

    public ngOnInit() {
        const paramMap = this.activatedRoute.snapshot.paramMap;
        this.mntnerKey = paramMap.get("mntnerKey");
        this.user = paramMap.get("user");
        this.alertsService.setGlobalSuccess("Success!");
    }

    public ngOnDestroy() {
        this.alertsService.clearAlertMessages();
    }
}

