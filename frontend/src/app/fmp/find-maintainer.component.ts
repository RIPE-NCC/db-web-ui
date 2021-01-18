import {Component, Inject, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import * as _ from "lodash";
import {FindMaintainerService, IFindMaintainer} from "./find-maintainer.service";
import {WINDOW} from "../core/window.service";
import {UserInfoService} from "../userinfo/user-info.service";
import {AlertsComponent} from "../shared/alert/alerts.component";

@Component({
    selector: "find-maintainer",
    templateUrl: "./find-maintainer.component.html",
})
export class FindMaintainerComponent {

    public foundMaintainer: IFindMaintainer;
    public maintainerKey: string;

    @ViewChild(AlertsComponent, {static: true})
    public alertsComponent: AlertsComponent;

    constructor(@Inject(WINDOW) private window: any,
                private findMaintainerService: FindMaintainerService,
                private userInfoService: UserInfoService,
                public router: Router) {
    }

    public ngOnInit() {
        this.checkLoggedIn();
    }

    public selectMaintainer(maintainerKey: string) {
        this.alertsComponent.clearAlertMessages();
        console.info("Search for mntner " + maintainerKey);
        this.findMaintainerService.search(maintainerKey)
            .subscribe((result: IFindMaintainer) => {
                this.foundMaintainer = result;
                if (this.foundMaintainer.expired === false) {
                    this.alertsComponent.addGlobalWarning(`There is already an open request to reset the password of this maintainer. Proceeding now will cancel the earlier request.`)
                }
            }, (error: string) => {
                if (this.foundMaintainer) { this.foundMaintainer.mntnerFound = false; }
                if (error === "switchToManualResetProcess") {
                    this.switchToManualResetProcess(maintainerKey, false);
                } else {
                    this.alertsComponent.addGlobalError(error);
                }
            });
    }

    public validateEmail() {
        const mntKey = this.foundMaintainer.maintainerKey;
        this.findMaintainerService.sendMail(mntKey)
            .subscribe(() => {
                this.router.navigate(["fmp/mailSent", this.foundMaintainer.email], {queryParams: {maintainerKey: mntKey}})
            }, (error: any) => {
                console.error("Error validating email:" + JSON.stringify(error));
                if (error.status !== 401 && error.status !== 403) {
                    if (_.isUndefined(error.data)) {
                        this.alertsComponent.addGlobalError("Error sending email");
                    } else if (error.data.match(/unable to send email/i)) {
                        this.alertsComponent.addGlobalError(error.data);
                    }
                    this.switchToManualResetProcess(mntKey, false);
                }
            });
    }

    public switchToManualResetProcess(maintainerKey: string, voluntaryChoice: boolean = true) {
        console.info("Switch to voluntary manual");
        this.router.navigate(["fmp/forgotMaintainerPassword"], {queryParams: {mntnerKey: maintainerKey, voluntary: voluntaryChoice,}});
    }

    public cancel() {
        this.window.history.back();
    }

    private checkLoggedIn() {
        this.userInfoService.getLoggedInUser()
            .subscribe(
                (res) => res,
                () => {
                    return this.router.navigate(["fmp/requireLogin"]);
                });
    }
}
