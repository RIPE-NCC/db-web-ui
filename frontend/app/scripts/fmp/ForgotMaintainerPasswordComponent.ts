interface IForgotMaintainerPassword {
    mntnerKey: string;
    reason: string;
    email: string;
    voluntary: boolean;
}

interface IForgotMaintainerState extends ng.ui.IStateParamsService {
    mntnerKey: string;
    voluntary: boolean;
}

class ForgotMaintainerPasswordController {

    public static $inject = [
        "$log",
        "$state",
        "$stateParams",
        "ForgotMaintainerPasswordService",
        "UserInfoService",
    ];

    public generatedPDFUrl: string;
    public fmpModel: IForgotMaintainerPassword;

    constructor(private $log: angular.ILogService,
                private $state: angular.ui.IStateService,
                private $stateParams: IForgotMaintainerState,
                private ForgotMaintainerPasswordService: IForgotMaintainerPasswordService,
                private userInfo: UserInfoService) {
        this.generatedPDFUrl = "";
        this.checkLoggedIn();

        this.fmpModel = {
            email: "",
            mntnerKey: $stateParams.mntnerKey,
            reason: "",
            voluntary: !!$stateParams.voluntary,
        };
    }

    public next(fmp: IForgotMaintainerPassword, formValid: boolean) {
        if (formValid) {
            this.$log.info("Form is valid, sending data to server.");
            this.ForgotMaintainerPasswordService.generatePdfAndEmail(fmp)
                .then((pdfUrl) =>
                    this.generatedPDFUrl = pdfUrl);
        }
    }

    private checkLoggedIn() {
        this.userInfo.getLoggedInUser().catch(() => {
            this.$state.go("fmp.requireLogin", {
                mntnerKey: this.fmpModel.mntnerKey,
                voluntary: this.fmpModel.voluntary,
            });
        });
    }
}

angular.module("fmp").component("fmp", {
    controller: ForgotMaintainerPasswordController,
    templateUrl: "scripts/fmp/forgotMaintainerPassword.html",
});
