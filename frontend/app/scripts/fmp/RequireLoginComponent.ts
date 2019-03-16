class RequireLoginController {

    public static $inject = [
        "$location",
        "$log",
        "Properties",
    ];
    public loginUrl: string;

    constructor(private $location: angular.ILocationService,
                private $log: angular.ILogService,
                private properties: IProperties) {

        this.$log.info("RequireLoginController starts");
        this.loginUrl = this.getLoginUrl();
    }

    private getLoginUrl(): string {
        return this.properties.LOGIN_URL +
            "?originalUrl=" + encodeURIComponent(this.$location.absUrl().split("#")[0] +
                "#/fmp/" + this.getReturnUrlForForgotMaintainerPassword());
    }

    private getReturnUrlForForgotMaintainerPassword() {
        if (this.$location.search().mntnerKey) {
            return "change-auth?mntnerKey=" +
                this.$location.search().mntnerKey +
                "&voluntary=" + Boolean(this.$location.search().voluntary);
        } else {
            return "";
        }
    }
}

angular.module("fmp").component("requireLogin", {
    controller: RequireLoginController,
    templateUrl: "./requireLogin.html",
});
