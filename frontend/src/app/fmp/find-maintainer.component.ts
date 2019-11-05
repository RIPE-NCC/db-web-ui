import {Component, Inject} from "@angular/core";
import {Router} from "@angular/router";
import * as _ from "lodash";
import {FindMaintainerService, IFindMaintainer} from "./find-maintainer.service";
import {WINDOW} from "../core/window.service";
import {UserInfoService} from "../userinfo/user-info.service";

enum AlertType {
    Error,
    Warning,
}

@Component({
    selector: "find-maintainer",
    templateUrl: "./find-maintainer.component.html",
})
export class FindMaintainerComponent {

    public foundMaintainer: IFindMaintainer;
    public maintainerKey: string;
    public errors: string[] = [];
    public warnings: string[] = [];

    constructor(@Inject(WINDOW) private window: any,
                private findMaintainerService: FindMaintainerService,
                private userInfoService: UserInfoService,
                public router: Router) {
    }

    public ngOnInit() {
        this.checkLoggedIn();
    }

    public selectMaintainer(maintainerKey: string) {
        this.clearAllAlerts();
        console.info("Search for mntner " + maintainerKey);
        this.findMaintainerService.search(maintainerKey)
            .subscribe((result: IFindMaintainer) => {
                this.foundMaintainer = result;
                if (this.foundMaintainer.expired === false) {
                    this.addAlert(
                        "There is already an open request to reset the password of this maintainer. " +
                        "Proceeding now will cancel the earlier request.", AlertType.Warning);
                }
            }, (error: string) => {
                if (this.foundMaintainer) { this.foundMaintainer.mntnerFound = false; }
                if (error === "switchToManualResetProcess") {
                    this.switchToManualResetProcess(maintainerKey, false);
                } else {
                    this.addAlert(error, AlertType.Error);
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
                        this.addAlert("Error sending email", AlertType.Error);
                    } else if (error.data.match(/unable to send email/i)) {
                        this.addAlert(error.data, AlertType.Error);
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

    private addAlert(message: string, type: AlertType, clearAllAlerts: boolean = true) {
        if (clearAllAlerts) {
            this.clearAllAlerts();
        }
        switch (type) {
            case AlertType.Error: {
                this.errors.push(message);
                break;
            }
            case AlertType.Warning: {
                this.warnings.push(message);
                break;
            }
        }
    }

    private clearAllAlerts() {
        this.errors = [];
        this.warnings = [];
    }
}
