enum AlertType {
    Error,
    Warning,
}

class FindMaintainerController {

    public static $inject = [
        "$window",
        "$log",
        "$state",
        "FindMaintainerService",
        "UserInfoService",
    ];
    public foundMaintainer: IFindMaintainer;
    public errors: string[] = [];
    public warnings: string[] = [];

    constructor(private $window: any,
                private $log: angular.ILogService,
                private $state: angular.ui.IStateService,
                private findMaintainerService: IFindMaintainerService,
                private userInfo: UserInfoService) {

        this.$log.info("FindMaintainerCtrl starts");
        this.checkLoggedIn();
    }

    public selectMaintainer(maintainerKey: string) {
        this.clearAllAlerts();
        this.$log.info("Search for mntner " + maintainerKey);
        this.findMaintainerService.search(maintainerKey)
            .then((result: IFindMaintainer) => {
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
        this.findMaintainerService.sendMail(mntKey).then(() => {
            this.$state.go("fmp.mailSent", {
                email: this.foundMaintainer.email,
                maintainerKey: mntKey,
            });
        }, (error: any) => {
            this.$log.error("Error validating email:" + JSON.stringify(error));
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
        this.$log.info("Switch to voluntary manual");
        this.$state.go("fmp.forgotMaintainerPassword", {
            mntnerKey: maintainerKey,
            voluntary: voluntaryChoice,
        });
    }

    public cancel() {
        this.$window.history.back();
    }

    private checkLoggedIn() {
        this.userInfo.getLoggedInUser().catch(() => {
            this.$state.go("fmp.requireLogin");
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

angular.module("fmp").component("findMaintainer", {
    controller: FindMaintainerController,
    templateUrl: "./findMaintainer.html",
});
